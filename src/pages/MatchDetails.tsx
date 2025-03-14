
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from "../components/layout/MainLayout";
import { fetchMatchDetails } from "../services/cricketApi";
import { MatchDetails as MatchDetailsType, Team } from "../types/cricket";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ResponsiveCard } from "@/components/ui/responsive-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

// Define a simplified type for match display
type DisplayableMatchInfo = {
  title: string;
  date?: string;
  venue?: string;
  result?: string;
  teams?: Team[];
};

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
        const data = await fetchMatchDetails(id);
        setMatchData(data);
        
        // Process match data for display
        if (data) {
          const displayData: DisplayableMatchInfo = { 
            title: "Match Information"
          };
          
          // Extract fixture date from Configuration if available
          if (data.Configuration) {
            // Additional processing for configuration data
          }
          
          // Extract teams
          if (data.Teams && data.Teams.Team) {
            displayData.teams = Array.isArray(data.Teams.Team) ? 
              data.Teams.Team : [data.Teams.Team];
          }
          
          setDisplayInfo(displayData);
        }
        
        setLoading(false);
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
              description={displayInfo.date ? `Date: ${displayInfo.date}` : "Date not available"}
              withAnimation
              animationDelay={200}
              className="overflow-hidden"
            >
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-2 text-xxs sm:text-sm">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-2">
                  {displayInfo.venue && (
                    <div className="flex items-center justify-between p-2 border-b text-xs">
                      <span className="font-medium">Venue</span>
                      <span className="text-right text-xxs sm:text-xs max-w-[60%] truncate">{displayInfo.venue}</span>
                    </div>
                  )}
                  
                  {displayInfo.result && (
                    <div className="flex items-center justify-between p-2 border-b text-xs">
                      <span className="font-medium">Result</span>
                      <span className="text-right text-xxs sm:text-xs max-w-[60%] truncate">{displayInfo.result}</span>
                    </div>
                  )}
                  
                  {/* Add more match details as needed */}
                </TabsContent>
                
                <TabsContent value="teams" className="space-y-2">
                  {displayInfo.teams && displayInfo.teams.length > 0 ? (
                    <div className="mobile-container">
                      {displayInfo.teams.map((team, index) => (
                        <div key={index} className="p-2 border rounded-md text-xs mb-2">
                          <h3 className="font-bold truncate">{team.Name}</h3>
                          <p className="text-xxs sm:text-xs">Team ID: {team.Id || "N/A"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No team information available</p>
                  )}
                </TabsContent>
                
                <TabsContent value="raw">
                  <ScrollArea className={`${isMobile ? 'h-[200px]' : 'h-[300px]'} rounded-md border`}>
                    <div className="p-2">
                      <pre className="whitespace-pre-wrap break-words text-xxs sm:text-xs">
                        {JSON.stringify(matchData, null, 2)}
                      </pre>
                    </div>
                  </ScrollArea>
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
