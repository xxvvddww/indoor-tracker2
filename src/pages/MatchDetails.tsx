
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from "../components/layout/MainLayout";
import { fetchMatchDetails } from "../services/cricketApi";
import { MatchDetails as MatchDetailsType } from "../types/cricket";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ResponsiveCard } from "@/components/ui/responsive-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [matchData, setMatchData] = useState<MatchDetailsType | null>(null);

  useEffect(() => {
    const loadMatchData = async () => {
      if (id) {
        setLoading(true);
        const data = await fetchMatchDetails(id);
        setMatchData(data);
        setLoading(false);
      }
    };

    loadMatchData();
  }, [id]);

  // Helper to render structured data
  const renderStructuredData = (data: Record<string, any>, title: string) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="rounded-md bg-secondary/10 p-4 overflow-x-auto">
          <pre className="text-xs md:text-sm whitespace-pre-wrap break-words">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight animate-fade-in">Match Details</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64 md:h-96">
            <LoadingSpinner size={8} />
          </div>
        ) : matchData ? (
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <ResponsiveCard 
              title={matchData.title || "Match Information"}
              description={`${matchData.date || "Date not available"}`}
              withAnimation
              animationDelay={200}
            >
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  {matchData.venue && (
                    <div className="flex items-center justify-between p-2 border-b">
                      <span className="font-medium">Venue</span>
                      <span>{matchData.venue}</span>
                    </div>
                  )}
                  
                  {matchData.result && (
                    <div className="flex items-center justify-between p-2 border-b">
                      <span className="font-medium">Result</span>
                      <span>{matchData.result}</span>
                    </div>
                  )}
                  
                  {/* Add more match details as needed */}
                </TabsContent>
                
                <TabsContent value="teams" className="space-y-4">
                  {matchData.teams && matchData.teams.map((team, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <h3 className="font-bold">{team.name}</h3>
                      <p>Score: {team.score || "N/A"}</p>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="raw">
                  <div className="overflow-auto bg-background p-4 rounded text-xs">
                    <pre>{JSON.stringify(matchData, null, 2)}</pre>
                  </div>
                </TabsContent>
              </Tabs>
            </ResponsiveCard>
          </div>
        ) : (
          <ResponsiveCard withAnimation animationDelay={100}>
            <p>No match data available</p>
          </ResponsiveCard>
        )}
      </div>
    </MainLayout>
  );
};

export default MatchDetails;
