
import React from 'react';
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Users, Trophy } from "lucide-react";
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
    { key: "C", header: "Contrib", hideOnMobile: true },
    { key: "SR", header: "S/R", hideOnMobile: true },
    { key: "Econ", header: "Econ", hideOnMobile: true },
  ];

  // Check if we have teams but no player stats
  if (!displayInfo.playerStats || Object.keys(displayInfo.playerStats).length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No player statistics available for this match</p>
      </div>
    );
  }

  // Check if we have empty player arrays
  const hasActualPlayers = Object.values(displayInfo.playerStats).some(
    team => team.players && team.players.length > 0
  );

  if (!hasActualPlayers) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No player statistics available for this match</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">Player Statistics</h3>
      
      {/* Man of the Match display */}
      {displayInfo.manOfMatch && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-amber-500/10 rounded-md border border-amber-500/20">
          <Trophy className="h-4 w-4 text-amber-500" />
          <p className="text-sm">{displayInfo.manOfMatch}</p>
        </div>
      )}
      
      {Object.keys(displayInfo.playerStats).map((teamId) => (
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
          
          {displayInfo.playerStats[teamId].players.length > 0 ? (
            <ResponsiveTable 
              data={displayInfo.playerStats[teamId].players} 
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
      ))}
    </div>
  );
};

export default PlayerStatistics;
