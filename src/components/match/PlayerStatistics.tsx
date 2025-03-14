
import React, { useEffect, useState } from 'react';
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { AlertCircle, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DisplayableMatchInfo } from './types';
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PlayerStatisticsProps {
  displayInfo: DisplayableMatchInfo;
}

export const PlayerStatistics: React.FC<PlayerStatisticsProps> = ({ displayInfo }) => {
  const isMobile = useIsMobile();
  // Use sessionStorage to persist the open/closed state between tab switches
  const [openTeams, setOpenTeams] = useState<Record<string, boolean>>(() => {
    try {
      const savedState = sessionStorage.getItem('cricket-team-collapsible-state');
      return savedState ? JSON.parse(savedState) : {};
    } catch {
      return {}; // If storage fails
    }
  });
  
  const [combinedSectionOpen, setCombinedSectionOpen] = useState<boolean>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('cricket-combined-collapsible-state') || 'false');
    } catch {
      return false;
    }
  });

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
          // Add team name to each player
          allPlayers.push({
            ...player,
            TeamName: team.name
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

  useEffect(() => {
    // Initialize all sections as closed by default
    if (displayInfo.teams && Object.keys(openTeams).length === 0) {
      const initialOpenState: Record<string, boolean> = {};
      displayInfo.teams.forEach(team => {
        initialOpenState[team.id] = false;
      });
      setOpenTeams(initialOpenState);
    }
  }, [displayInfo.teams, openTeams]);

  // Save state to sessionStorage when it changes
  useEffect(() => {
    try {
      sessionStorage.setItem('cricket-team-collapsible-state', JSON.stringify(openTeams));
      sessionStorage.setItem('cricket-combined-collapsible-state', JSON.stringify(combinedSectionOpen));
    } catch (e) {
      console.error('Error saving collapsible state to sessionStorage:', e);
    }
  }, [openTeams, combinedSectionOpen]);

  // Define player stat columns for the table - same for all teams to ensure alignment
  const playerColumns = [
    { 
      key: "Name", 
      header: "Player", 
      className: "font-medium",
      render: (value: string, row: any) => (
        <div className="flex flex-col">
          <span>{value}</span>
          {row.TeamName && <span className="text-xs text-muted-foreground">{row.TeamName}</span>}
        </div>
      )
    },
    { key: "RS", header: "Runs", hideOnMobile: false },
    { key: "OB", header: "Overs", hideOnMobile: true },
    { key: "RC", header: "R Con", hideOnMobile: false },
    { key: "Wkts", header: "Wickets", hideOnMobile: false },
    { key: "SR", header: "S/R", hideOnMobile: true },
    { key: "Econ", header: "Econ", hideOnMobile: true },
    { 
      key: "C", 
      header: "Contrib", 
      hideOnMobile: false,
      render: (value: string) => {
        const contrib = parseFloat(value || '0');
        const textColor = contrib > 0 ? 'text-green-600' : 'text-red-500';
        const bgColor = contrib > 0 ? 'bg-green-50' : 'bg-red-50';
        const borderColor = contrib > 0 ? 'border-green-200' : 'border-red-200';
        
        return (
          <span className={`px-1.5 py-0.5 rounded ${textColor} ${bgColor} ${borderColor} border`}>
            {value || '0'}
          </span>
        );
      }
    },
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
      <h3 className="text-sm font-medium mb-2">Player Statistics</h3>
      
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
            <Collapsible key={team.id} open={isOpen} onOpenChange={() => toggleTeam(team.id)} className="border rounded-md overflow-hidden mb-4">
              <CollapsibleTrigger className="w-full px-4 py-2 flex items-center justify-between bg-muted/30 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">
                    {team.name}
                    {displayInfo.winnerId === team.id && (
                      <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-600 border-green-500">
                        Winner
                      </Badge>
                    )}
                  </h3>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                {hasTeamPlayers ? (
                  <div className="p-2">
                    <ResponsiveTable 
                      data={teamStats.players} 
                      columns={playerColumns}
                      superCompact={isMobile}
                      ultraCompact={false}
                      className="mt-1"
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
        <Collapsible open={combinedSectionOpen} onOpenChange={toggleCombined} className="border rounded-md overflow-hidden mb-4">
          <CollapsibleTrigger className="w-full px-4 py-2 flex items-center justify-between bg-muted/30 hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Combined Player Statistics</h3>
            </div>
            {combinedSectionOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-2">
              <ResponsiveTable 
                data={combinedPlayers} 
                columns={playerColumns}
                superCompact={isMobile}
                ultraCompact={false}
                className="mt-1"
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
