
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import MatchWinner from './MatchWinner';
import PlayerStatistics from './PlayerStatistics';

interface MatchOverviewProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const MatchOverview: React.FC<MatchOverviewProps> = ({ displayInfo, matchData }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      {/* Match Winner Section */}
      <MatchWinner displayInfo={displayInfo} />

      {/* Match Details Section */}
      <div className="space-y-2 mb-4">
        {displayInfo.date && (
          <div className="flex items-center justify-between p-2 border-b text-xs">
            <span className="font-medium">Date</span>
            <span className="text-right text-xxs sm:text-xs max-w-[60%] truncate">{displayInfo.date}</span>
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
      </div>

      {/* Player Stats for Each Team */}
      <PlayerStatistics displayInfo={displayInfo} />
    </div>
  );
};

export default MatchOverview;
