
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from "../components/layout/MainLayout";
import { fetchMatchDetails } from "../services/cricketApi";
import { MatchDetails as MatchDetailsType, Team, PlayerMatchSummary } from "../types/cricket";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ResponsiveCard } from "@/components/ui/responsive-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users } from "lucide-react";

// Define a simplified type for match display
type DisplayableMatchInfo = {
  title: string;
  date?: string;
  venue?: string;
  result?: string;
  teams?: Team[];
  winner?: string;
  winnerId?: string;
  playerStats?: {
    team1?: {
      name: string;
      id: string;
      players: PlayerMatchSummary[];
    };
    team2?: {
      name: string;
      id: string;
      players: PlayerMatchSummary[];
    };
  };
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
          
          // Extract teams
          if (data.Teams && data.Teams.Team) {
            displayData.teams = Array.isArray(data.Teams.Team) ? 
              data.Teams.Team : [data.Teams.Team];
          }
          
          // Extract match summary and winner information
          if (data.MatchSummary) {
            // Get man of the match if available
            if (data.MatchSummary.manOfMatch) {
              displayData.result = `Man of the Match: ${data.MatchSummary.manOfMatch}`;
            }
            
            // Process team stats
            if (data.MatchSummary.team && Array.isArray(data.MatchSummary.team)) {
              displayData.playerStats = {};
              
              // Process each team's player stats
              data.MatchSummary.team.forEach((team, index) => {
                const teamKey = index === 0 ? 'team1' : 'team2';
                
                if (displayData.playerStats) {
                  displayData.playerStats[teamKey] = {
                    name: team.name || `Team ${index + 1}`,
                    id: `team-${index}`,
                    players: Array.isArray(team.player) ? team.player : [team.player]
                  };
                }
              });
            }
            
            // Determine winner
            if (data.Skins && data.Skins.Skin && data.Teams && data.Teams.Team) {
              const skins = Array.isArray(data.Skins.Skin) ? data.Skins.Skin : [data.Skins.Skin];
              const teams = Array.isArray(data.Teams.Team) ? data.Teams.Team : [data.Teams.Team];
              
              if (skins.length > 0 && teams.length === 2) {
                const lastSkin = skins[skins.length - 1];
                const team1Score = parseInt(lastSkin.Team1Score || '0') + parseInt(lastSkin.Team1BonusPenaltyRuns || '0');
                const team2Score = parseInt(lastSkin.Team2Score || '0') + parseInt(lastSkin.Team2BonusPenaltyRuns || '0');
                
                if (team1Score > team2Score) {
                  displayData.winner = teams[0].Name;
                  displayData.winnerId = teams[0].Id;
                } else if (team2Score > team1Score) {
                  displayData.winner = teams[1].Name;
                  displayData.winnerId = teams[1].Id;
                } else {
                  displayData.winner = "Draw";
                }
              }
            }
          }
          
          setDisplayInfo(displayData);
        }
        
        setLoading(false);
      }
    };

    loadMatchData();
  }, [id]);

  // Define player stat columns for the table
  const playerColumns = [
    { key: "Name", header: "Player", className: "font-medium" },
    { key: "RS", header: "Runs", hideOnMobile: false },
    { key: "OB", header: "Overs", hideOnMobile: true },
    { key: "RC", header: "R Con", hideOnMobile: false },
    { key: "Wkts", header: "Wickets", hideOnMobile: false },
    { key: "SR", header: "S/R", hideOnMobile: true },
    { key: "Econ", header: "Econ", hideOnMobile: true },
  ];

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
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-2 text-xxs sm:text-sm">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  {/* Match Winner Section */}
                  {displayInfo.winner && (
                    <div className="bg-slate-800/30 p-3 rounded-md flex items-center gap-3 mb-4">
                      <Trophy className="h-6 w-6 text-amber-400" />
                      <div>
                        <h3 className="text-sm font-medium text-white">Match Winner</h3>
                        <p className={`text-base font-bold ${displayInfo.winner === "Draw" ? "text-blue-400" : "text-amber-400"}`}>
                          {displayInfo.winner}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Player Stats for Each Team */}
                  {displayInfo.playerStats?.team1 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">
                          {displayInfo.playerStats.team1.name}
                          {displayInfo.winnerId === displayInfo.playerStats.team1.id && (
                            <Badge variant="outline" className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500">
                              Winner
                            </Badge>
                          )}
                        </h3>
                      </div>
                      <ResponsiveTable 
                        data={displayInfo.playerStats.team1.players} 
                        columns={playerColumns}
                        superCompact={isMobile}
                        ultraCompact={false}
                        className="mt-1"
                        resultsMode
                      />
                    </div>
                  )}

                  {displayInfo.playerStats?.team2 && (
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">
                          {displayInfo.playerStats.team2.name}
                          {displayInfo.winnerId === displayInfo.playerStats.team2.id && (
                            <Badge variant="outline" className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500">
                              Winner
                            </Badge>
                          )}
                        </h3>
                      </div>
                      <ResponsiveTable 
                        data={displayInfo.playerStats.team2.players} 
                        columns={playerColumns}
                        superCompact={isMobile}
                        ultraCompact={false}
                        className="mt-1"
                        resultsMode
                      />
                    </div>
                  )}

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
