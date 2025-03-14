
import React from 'react';
import { CalendarIcon, MapPinIcon, UserIcon, TrophyIcon, TimerIcon, BookOpenIcon } from "lucide-react";
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
          <span className="font-medium flex items-center gap-1.5">
            <CalendarIcon className="h-3 w-3 text-primary" />
            Date
          </span>
          <span className="text-right text-xxs sm:text-xs max-w-[60%] truncate">
            {displayInfo.date}
            {displayInfo.time && `, ${displayInfo.time}`}
          </span>
        </div>
      )}
      
      {displayInfo.venue && (
        <div className="flex items-center justify-between p-2 border-b text-xs">
          <span className="font-medium flex items-center gap-1.5">
            <MapPinIcon className="h-3 w-3 text-primary" />
            Venue
          </span>
          <span className="text-right text-xxs sm:text-xs max-w-[60%] truncate">{displayInfo.venue}</span>
        </div>
      )}
      
      {displayInfo.matchType && (
        <div className="flex items-center justify-between p-2 border-b text-xs">
          <span className="font-medium flex items-center gap-1.5">
            <BookOpenIcon className="h-3 w-3 text-primary" />
            Format
          </span>
          <span className="text-right text-xxs sm:text-xs max-w-[60%] truncate">{displayInfo.matchType}</span>
        </div>
      )}
      
      {displayInfo.tournament && (
        <div className="flex items-center justify-between p-2 border-b text-xs">
          <span className="font-medium flex items-center gap-1.5">
            <TrophyIcon className="h-3 w-3 text-primary" />
            Tournament
          </span>
          <span className="text-right text-xxs sm:text-xs max-w-[60%] truncate">{displayInfo.tournament}</span>
        </div>
      )}
      
      {displayInfo.manOfMatch && (
        <div className="flex items-center justify-between p-2 border-b text-xs">
          <span className="font-medium flex items-center gap-1.5">
            <UserIcon className="h-3 w-3 text-primary" />
            Man of Match
          </span>
          <span className="text-right text-xxs sm:text-xs max-w-[60%] truncate">{displayInfo.manOfMatch}</span>
        </div>
      )}
      
      {displayInfo.result && (
        <div className="flex items-center justify-between p-2 border-b text-xs">
          <span className="font-medium flex items-center gap-1.5">
            <TimerIcon className="h-3 w-3 text-primary" />
            Result
          </span>
          <span className="text-right text-xxs sm:text-xs max-w-[60%] truncate">{displayInfo.result}</span>
        </div>
      )}
      
      {displayInfo.umpires && displayInfo.umpires.length > 0 && (
        <div className="flex items-center justify-between p-2 border-b text-xs">
          <span className="font-medium">Umpires</span>
          <span className="text-right text-xxs sm:text-xs max-w-[60%] truncate">
            {displayInfo.umpires.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
};

export default MatchHeader;
