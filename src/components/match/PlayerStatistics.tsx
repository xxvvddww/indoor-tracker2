
import React from 'react';
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Users, Trophy, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DisplayableMatchInfo } from './types';
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayerStatisticsProps {
  displayInfo: DisplayableMatchInfo;
}

export const PlayerStatistics: React.FC<PlayerStatisticsProps> = ({ displayInfo }) => {
  const isMobile = useIsMobile();

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

  // Always display winner at the top if available
  const WinnerDisplay = () => {
    if (displayInfo.winner) {
      return (
        <div className="flex items-center gap-2 mb-4 p-2 bg-amber-500/10 rounded-md border border-amber-500/20">
          <Trophy className="h-4 w-4 text-amber-500" />
          <p className="text-sm">
            <span className="font-medium">Winner:</span> {displayInfo.winner}
          </p>
        </div>
      );
    }
    return null;
  };

  // Show Man of the Match if available
  const ManOfMatchDisplay = () => {
    if (displayInfo.manOfMatch) {
      return (
        <div className="flex items-center gap-2 mb-4 p-2 bg-amber-500/10 rounded-md border border-amber-500/20">
          <Trophy className="h-4 w-4 text-amber-500" />
          <p className="text-sm">
            <span className="font-medium">Player of the Match:</span> {displayInfo.manOfMatch}
          </p>
        </div>
      );
    }
    return null;
  };

  // Check if we have player stats data in any team
  const hasPlayerStats = displayInfo.playerStats && 
    Object.keys(displayInfo.playerStats).length > 0 &&
    Object.values(displayInfo.playerStats).some(
      team => team.players && team.players.length > 0
    );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">Player Statistics</h3>
      
      {/* Always show winner at top if available */}
      <WinnerDisplay />
      <ManOfMatchDisplay />
      
      {/* If no teams, show message */}
      {(!displayInfo.teams || displayInfo.teams.length === 0) ? (
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-md text-center justify-center">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No team information available for this match</p>
        </div>
      ) : (
        /* Show teams and their players */
        displayInfo.teams.map((team) => {
          // Find the team in playerStats
          const teamStats = displayInfo.playerStats && displayInfo.playerStats[team.id];
          const hasTeamPlayers = teamStats && teamStats.players && teamStats.players.length > 0;
          
          return (
            <div key={team.id} className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">
                  {team.name}
                  {displayInfo.winnerId === team.id && (
                    <Badge variant="outline" className="ml-2 bg-amber-500/20 text-amber-600 border-amber-500">
                      Winner
                    </Badge>
                  )}
                </h3>
              </div>
              
              {hasTeamPlayers ? (
                <ResponsiveTable 
                  data={teamStats.players} 
                  columns={playerColumns}
                  superCompact={isMobile}
                  ultraCompact={false}
                  className="mt-1"
                  resultsMode
                />
              ) : (
                <p className="text-xs text-muted-foreground mt-1">No player data available for this team</p>
              )}
            </div>
          );
        })
      )}
      
      {/* Show general message if no player stats */}
      {!hasPlayerStats && displayInfo.teams && displayInfo.teams.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-md text-center justify-center">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No player statistics available for this match</p>
        </div>
      )}
    </div>
  );
};

export default PlayerStatistics;
