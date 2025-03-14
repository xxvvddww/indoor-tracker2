
import React from 'react';
import { DisplayableMatchInfo } from './types';

interface MatchTeamsProps {
  displayInfo: DisplayableMatchInfo;
}

export const MatchTeams: React.FC<MatchTeamsProps> = ({ displayInfo }) => {
  if (!displayInfo || !displayInfo.teams || displayInfo.teams.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-2 mb-4">
      <h3 className="text-sm font-medium mb-2">Teams</h3>
      {displayInfo.teams.map((team, index) => (
        <div key={index} className={`p-2 border rounded-md text-xs mb-2 ${team.isWinner ? 'border-amber-500 bg-amber-900/20' : ''}`}>
          <h4 className="font-medium">{team.name}</h4>
          <p className="text-xxs">ID: {team.id}</p>
          {team.isWinner && <span className="text-xxs text-amber-400">Winner</span>}
        </div>
      ))}
    </div>
  );
};

export default MatchTeams;
