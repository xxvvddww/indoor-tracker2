
import React, { useEffect, useState } from 'react';
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DisplayableMatchInfo } from './types';
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PlayerStatisticsProps {
  displayInfo: DisplayableMatchInfo;
}

export const PlayerStatistics: React.FC<PlayerStatisticsProps> = ({ displayInfo }) => {
  const isMobile = useIsMobile();
  // Initialize all sections as closed by default
  const [openTeams, setOpenTeams] = useState<Record<string, boolean>>({});
  const [combinedSectionOpen, setCombinedSectionOpen] = useState<boolean>(false);

  // Get winning team to display at the top
  const sortedTeams = React.useMemo(() => {
    if (!displayInfo.teams || displayInfo.teams.length === 0) return [];
    
    return [...displayInfo.teams].sort((a, b) => {
      if (a.id === displayInfo.winnerId) return -1;
      if (b.id === displayInfo.winnerId) return 1;
      return 0;
    });
  }, [displayInfo.teams, displayInfo.winnerId]);

  // Create combined player stats
  const combinedPlayers = React.useMemo(() => {
    if (!displayInfo.playerStats) return [];
    
    const allPlayers: any[] = [];
    
    Object.values(displayInfo.playerStats).forEach(team => {
      team.players.forEach(player => {
        if (!player.Name.includes("No player statistics") && player.Name !== "Unknown Player") {
          // Extract just the player name without team name
          const playerNameOnly = player.Name.split(' - ').pop() || player.Name;
          
          allPlayers.push({
            ...player,
            Name: playerNameOnly // Remove team name from player display
          });
        }
      });
    });
    
    // Sort by contribution margin (highest first)
    return allPlayers.sort((a, b) => {
      const aContrib = parseFloat(a.C || '0');
      const bContrib = parseFloat(b.C || '0');
      return bContrib - aContrib;
    });
  }, [displayInfo.playerStats]);

  // Define player stat columns for the team tables - match the example image
  const playerColumns = [
    { 
      key: "Name", 
      header: "Player", 
      className: "player-column",
      width: "60%",
      render: (value: string) => <div className="break-words whitespace-normal">{value}</div>
    },
    { 
      key: "RS", 
      header: "R", 
      hideOnMobile: false,
      align: "right" as const,
      className: "stat-column",
      width: "8%"
    },
    { 
      key: "RC", 
      header: "RA", 
      hideOnMobile: false,
      align: "right" as const,
      className: "stat-column",
      width: "8%"
    },
    { 
      key: "Wkts", 
      header: "W", 
      hideOnMobile: false,
      align: "right" as const,
      className: "stat-column",
      width: "8%"
    },
    { 
      key: "SR", 
      header: "SR", 
      hideOnMobile: false,
      align: "right" as const,
      className: "stat-column",
      width: "8%",
      render: (value: string) => {
        const srValue = parseFloat(value || '0');
        return Math.round(srValue);
      }
    },
    { 
      key: "C", 
      header: "C", 
      hideOnMobile: false,
      align: "right" as const,
      className: "stat-column",
      width: "8%"
    }
  ];

  // Check if we have any player stats
  const hasPlayerStats = displayInfo.playerStats && 
    Object.keys(displayInfo.playerStats).length > 0 &&
    Object.values(displayInfo.playerStats).some(team => 
      team.players && team.players.length > 0
    );

  // Function to check if a team has actual player data (not just placeholders)
  const hasRealPlayerData = (teamId: string) => {
    if (!displayInfo.playerStats || !displayInfo.playerStats[teamId]) return false;
    
    const teamPlayers = displayInfo.playerStats[teamId].players;
    return teamPlayers.some(player => 
      !player.Name.includes("No player statistics") && player.Name !== "Unknown Player"
    );
  };

  const toggleTeam = (teamId: string) => {
    setOpenTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  const toggleCombined = () => {
    setCombinedSectionOpen(prev => !prev);
  };

  return (
    <div className="space-y-4">
      {/* Show teams with player stats */}
      {(!displayInfo.teams || displayInfo.teams.length === 0) ? (
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-md text-center justify-center">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No team information available for this match</p>
        </div>
      ) : (
        sortedTeams.map((team) => {
          const teamStats = displayInfo.playerStats && displayInfo.playerStats[team.id];
          const hasTeamPlayers = teamStats && teamStats.players && teamStats.players.length > 0;
          const hasActualPlayers = hasRealPlayerData(team.id);
          const isOpen = openTeams[team.id] || false;
          
          return (
            <Collapsible key={team.id} open={isOpen} onOpenChange={() => toggleTeam(team.id)} className="border rounded-md overflow-hidden mb-4 bg-muted/10">
              <CollapsibleTrigger className="w-full px-4 py-2 flex items-center justify-between bg-muted/30 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium truncate">
                    {team.name}
                    {displayInfo.winnerId === team.id && (
                      <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-600 border-green-500">
                        Winner
                      </Badge>
                    )}
                  </h3>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                {hasTeamPlayers ? (
                  <div className="p-0">
                    <ResponsiveTable 
                      data={teamStats.players} 
                      columns={playerColumns}
                      superCompact={true}
                      ultraCompact={false}
                      className="mt-0"
                      resultsMode
                    />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1 p-4 bg-muted/30 rounded-md">
                    No player data available for this team
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })
      )}
      
      {/* Combined player stats section */}
      {combinedPlayers.length > 0 && (
        <Collapsible open={combinedSectionOpen} onOpenChange={toggleCombined} className="border rounded-md overflow-hidden mb-4 bg-muted/10">
          <CollapsibleTrigger className="w-full px-4 py-2 flex items-center justify-between bg-muted/30 hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium truncate">Combined Player Statistics</h3>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-0">
              <ResponsiveTable 
                data={combinedPlayers} 
                columns={playerColumns}
                superCompact={true}
                ultraCompact={false}
                className="mt-0"
                resultsMode
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {/* Show message if no player stats */}
      {displayInfo.teams && displayInfo.teams.length > 0 && !hasPlayerStats && (
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-md text-center justify-center mt-4">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No player statistics available for this match</p>
        </div>
      )}
    </div>
  );
};

export default PlayerStatistics;
