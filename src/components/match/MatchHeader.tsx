
import React from 'react';
import { DisplayableMatchInfo } from './types';

interface MatchHeaderProps {
  displayInfo: DisplayableMatchInfo;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({ displayInfo }) => {
  if (!displayInfo) return null;
  
  return (
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
  );
};

export default MatchHeader;
