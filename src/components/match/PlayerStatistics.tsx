
import React from 'react';
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Users } from "lucide-react";
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

  if (!displayInfo.playerStats || Object.keys(displayInfo.playerStats).length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No player statistics available for this match</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">Player Statistics</h3>
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
    </div>
  );
};

export default PlayerStatistics;
