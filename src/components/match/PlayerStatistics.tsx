
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
  const [openTeams, setOpenTeams] = useState<Record<string, boolean>>({});

  // Get winning team to display at the top
  const sortedTeams = React.useMemo(() => {
    if (!displayInfo.teams || displayInfo.teams.length === 0) return [];
    
    return [...displayInfo.teams].sort((a, b) => {
      if (a.id === displayInfo.winnerId) return -1;
      if (b.id === displayInfo.winnerId) return 1;
      return 0;
    });
  }, [displayInfo.teams, displayInfo.winnerId]);

  useEffect(() => {
    // Initialize all sections as open
    if (displayInfo.teams) {
      const initialOpenState: Record<string, boolean> = {};
      displayInfo.teams.forEach(team => {
        initialOpenState[team.id] = true;
      });
      setOpenTeams(initialOpenState);
    }
  }, [displayInfo.teams]);

  // Define player stat columns for the table - same for all teams to ensure alignment
  const playerColumns = [
    { key: "Name", header: "Player", className: "font-medium" },
    { key: "RS", header: "Runs", hideOnMobile: false },
    { key: "OB", header: "Overs", hideOnMobile: true },
    { key: "RC", header: "R Con", hideOnMobile: false },
    { key: "Wkts", header: "Wickets", hideOnMobile: false },
    { key: "SR", header: "S/R", hideOnMobile: true },
    { key: "Econ", header: "Econ", hideOnMobile: true },
    { key: "C", header: "Contribution", hideOnMobile: false },
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
          const isOpen = openTeams[team.id];
          
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
