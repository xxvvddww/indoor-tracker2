
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { DisplayableMatchInfo } from './types';

interface TeamDetailsProps {
  teams: DisplayableMatchInfo['teams'];
}

export const TeamDetails: React.FC<TeamDetailsProps> = ({ teams }) => {
  if (!teams || teams.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No team information available</p>
    );
  }
  
  return (
    <div className="mobile-container">
      {teams.map((team, index) => (
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
  );
};

export default TeamDetails;
