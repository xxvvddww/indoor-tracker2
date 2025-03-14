
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from "../components/layout/MainLayout";
import { fetchMatchDetails } from "../services/cricketApi";
import { MatchDetails as MatchDetailsType } from "../types/cricket";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ResponsiveCard } from "@/components/ui/responsive-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { DisplayableMatchInfo } from '@/components/match/types';
import MatchOverview from '@/components/match/MatchOverview';
import TeamDetails from '@/components/match/TeamDetails';
import RawMatchData from '@/components/match/RawMatchData';
import { processMatchData } from '@/utils/matchDataProcessors';

const MatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [matchData, setMatchData] = useState<MatchDetailsType | null>(null);
  const [displayInfo, setDisplayInfo] = useState<DisplayableMatchInfo>({ title: "Match Information" });
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadMatchData = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await fetchMatchDetails(id);
          console.log("Raw match data:", data);
          setMatchData(data);
          
          // Process match data for display
          if (data) {
            const displayData = processMatchData(data);
            setDisplayInfo(displayData);
          }
        } catch (error) {
          console.error("Error loading match data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadMatchData();
  }, [id]);

  return (
    <MainLayout>
      <div className="space-y-4 w-full mx-auto px-0">
        <h1 className="text-lg md:text-2xl font-bold tracking-tight animate-fade-in">Match Details</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size={8} />
          </div>
        ) : matchData ? (
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <ResponsiveCard 
              title={displayInfo.title}
              description={displayInfo.date ? `Date: ${displayInfo.date}` : "Match details"}
              withAnimation
              animationDelay={200}
              className="overflow-hidden"
            >
              <Tabs defaultValue="stats" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-2 text-xxs sm:text-sm">
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="stats" className="space-y-4">
                  <MatchOverview displayInfo={displayInfo} matchData={matchData} />
                </TabsContent>
                
                <TabsContent value="teams" className="space-y-2">
                  <TeamDetails teams={displayInfo.teams} />
                </TabsContent>
                
                <TabsContent value="raw">
                  <RawMatchData matchData={matchData} />
                </TabsContent>
              </Tabs>
            </ResponsiveCard>
          </div>
        ) : (
          <ResponsiveCard withAnimation animationDelay={100}>
            <p className="text-xs sm:text-sm">No match data available</p>
          </ResponsiveCard>
        )}
      </div>
    </MainLayout>
  );
};

export default MatchDetails;
