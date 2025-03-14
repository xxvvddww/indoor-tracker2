
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from "../components/layout/MainLayout";
import { fetchMatchDetails } from "../services/cricketApi";
import { MatchDetails as MatchDetailsType } from "../types/cricket";
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
  teams?: {
    id: string;
    name: string;
    isWinner?: boolean;
  }[];
  winner?: string;
  winnerId?: string;
  playerStats?: {
    [teamId: string]: {
      name: string;
      players: {
        Name: string;
        RS?: string; // Runs scored
        OB?: string; // Overs bowled
        RC?: string; // Runs conceded
        Wkts?: string; // Wickets
        SR?: string; // Strike rate
        Econ?: string; // Economy
        [key: string]: any;
      }[];
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
        try {
          const data = await fetchMatchDetails(id);
          console.log("Raw match data:", data);
          setMatchData(data);
          
          // Process match data for display
          if (data) {
            const displayData: DisplayableMatchInfo = { 
              title: "Match Information",
              playerStats: {},
              teams: []
            };
            
            // Extract teams first
            if (data.Statistics && data.Statistics[0]?.Teams?.Team) {
              const teamsData = Array.isArray(data.Statistics[0].Teams.Team) ? 
                data.Statistics[0].Teams.Team : [data.Statistics[0].Teams.Team];
              
              displayData.teams = teamsData.map(team => ({
                id: team.Id,
                name: team.Name,
                isWinner: false // Will set later
              }));
              
              // Try to determine winner
              if (data.Statistics[0]?.Skins?.Skin) {
                const skins = Array.isArray(data.Statistics[0].Skins.Skin) ? 
                  data.Statistics[0].Skins.Skin : [data.Statistics[0].Skins.Skin];
                
                if (skins.length > 0 && teamsData.length === 2) {
                  const lastSkin = skins[skins.length - 1];
                  const team1Score = parseInt(lastSkin.Team1Score || '0') + parseInt(lastSkin.Team1BonusPenaltyRuns || '0');
                  const team2Score = parseInt(lastSkin.Team2Score || '0') + parseInt(lastSkin.Team2BonusPenaltyRuns || '0');
                  
                  if (team1Score > team2Score) {
                    displayData.winner = teamsData[0].Name;
                    displayData.winnerId = teamsData[0].Id;
                    if (displayData.teams) displayData.teams[0].isWinner = true;
                  } else if (team2Score > team1Score) {
                    displayData.winner = teamsData[1].Name;
                    displayData.winnerId = teamsData[1].Id;
                    if (displayData.teams) displayData.teams[1].isWinner = true;
                  } else {
                    displayData.winner = "Draw";
                  }
                }
              } else if (data.Statistics[0]?.Points) {
                // Alternative way to determine winner based on points
                const team1Points = parseInt(teamsData[0].Points || '0');
                const team2Points = parseInt(teamsData[1].Points || '0');
                
                if (team1Points > team2Points) {
                  displayData.winner = teamsData[0].Name;
                  displayData.winnerId = teamsData[0].Id;
                  if (displayData.teams) displayData.teams[0].isWinner = true;
                } else if (team2Points > team1Points) {
                  displayData.winner = teamsData[1].Name;
                  displayData.winnerId = teamsData[1].Id;
                  if (displayData.teams) displayData.teams[1].isWinner = true;
                } else {
                  displayData.winner = "Draw";
                }
              }
            }
            
            // Extract player stats
            if (data.Statistics && data.Statistics[0]?.MatchSummary?.team) {
              const teams = Array.isArray(data.Statistics[0].MatchSummary.team) ? 
                data.Statistics[0].MatchSummary.team : [data.Statistics[0].MatchSummary.team];
              
              teams.forEach(team => {
                if (team.id && team.name) {
                  const players = Array.isArray(team.player) ? team.player : team.player ? [team.player] : [];
                  
                  if (!displayData.playerStats) {
                    displayData.playerStats = {};
                  }
                  
                  displayData.playerStats[team.id] = {
                    name: team.name,
                    players: players.map(player => ({
                      Name: player.Name || 'Unknown',
                      RS: player.RS || '0',  // Runs scored
                      OB: player.OB || '0',  // Overs bowled
                      RC: player.RC || '0',  // Runs conceded
                      Wkts: player.Wkts || '0', // Wickets
                      SR: player.SR || '0',   // Strike rate
                      Econ: player.Econ || '0' // Economy
                    }))
                  };
                }
              });
            }
            
            // If no player stats found in MatchSummary, try to create from Batsmen/Bowlers
            if (!displayData.playerStats || Object.keys(displayData.playerStats).length === 0) {
              console.log("Attempting to create player stats from Batsmen/Bowlers");
              
              if (data.Statistics && data.Statistics[0]?.Batsmen?.Batsman && data.Statistics[0]?.Teams?.Team) {
                const batsmen = Array.isArray(data.Statistics[0].Batsmen.Batsman) ? 
                  data.Statistics[0].Batsmen.Batsman : [data.Statistics[0].Batsmen.Batsman];
                
                const bowlers = Array.isArray(data.Statistics[0].Bowlers?.Bowler) ? 
                  data.Statistics[0].Bowlers.Bowler : data.Statistics[0].Bowlers?.Bowler ? [data.Statistics[0].Bowlers.Bowler] : [];
                
                const teams = Array.isArray(data.Statistics[0].Teams.Team) ? 
                  data.Statistics[0].Teams.Team : [data.Statistics[0].Teams.Team];
                
                // Initialize player stats for each team
                if (!displayData.playerStats) displayData.playerStats = {};
                
                teams.forEach(team => {
                  const teamId = team.Id;
                  const teamName = team.Name;
                  
                  if (!displayData.playerStats![teamId]) {
                    displayData.playerStats![teamId] = {
                      name: teamName,
                      players: []
                    };
                  }
                  
                  // Get team's batsmen
                  const teamBatsmen = batsmen.filter(player => player.TeamId === teamId);
                  
                  // Create player records
                  teamBatsmen.forEach(batsman => {
                    displayData.playerStats![teamId].players.push({
                      Name: batsman.Name,
                      RS: '0',  // Default values
                      OB: '0',
                      RC: '0',
                      Wkts: '0',
                      SR: '0',
                      Econ: '0'
                    });
                  });
                });
              }
            }
            
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
                  {displayInfo.playerStats && Object.keys(displayInfo.playerStats).map((teamId) => (
                    <div key={teamId} className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">
                          {displayInfo.playerStats![teamId].name}
                          {displayInfo.winnerId === teamId && (
                            <Badge variant="outline" className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500">
                              Winner
                            </Badge>
                          )}
                        </h3>
                      </div>
                      <ResponsiveTable 
                        data={displayInfo.playerStats[teamId].players} 
                        columns={playerColumns}
                        superCompact={isMobile}
                        ultraCompact={false}
                        className="mt-1"
                        resultsMode
                      />
                    </div>
                  ))}

                  {/* Show Empty State if no player stats */}
                  {(!displayInfo.playerStats || Object.keys(displayInfo.playerStats).length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No player statistics available for this match</p>
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
                        <div key={index} className={`p-2 border rounded-md text-xs mb-2 ${team.isWinner ? 'border-amber-500 bg-amber-900/20' : ''}`}>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold truncate">{team.name}</h3>
                            {team.isWinner && (
                              <Badge variant="outline" className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500">
                                Winner
                              </Badge>
                            )}
                          </div>
                          <p className="text-xxs sm:text-xs">Team ID: {team.id || "N/A"}</p>
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
