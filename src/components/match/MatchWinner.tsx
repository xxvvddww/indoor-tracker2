
import React from 'react';
import { Trophy } from "lucide-react";
import { DisplayableMatchInfo } from './types';

interface MatchWinnerProps {
  displayInfo: DisplayableMatchInfo;
}

export const MatchWinner: React.FC<MatchWinnerProps> = ({ displayInfo }) => {
  if (!displayInfo.winner) {
    return null;
  }
  
  return (
    <div className="bg-slate-800/30 p-3 rounded-md flex items-center gap-3 mb-4">
      <Trophy className="h-6 w-6 text-amber-400" />
      <div>
        <h3 className="text-sm font-medium text-white">Match Winner</h3>
        <p className={`text-base font-bold ${displayInfo.winner === "Draw" ? "text-blue-400" : "text-amber-400"}`}>
          {displayInfo.winner}
        </p>
      </div>
    </div>
  );
};

export default MatchWinner;
