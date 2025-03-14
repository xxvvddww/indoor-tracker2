
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { MatchDetails } from '../../types/cricket';

interface RawMatchDataProps {
  matchData: MatchDetails | null;
}

export const RawMatchData: React.FC<RawMatchDataProps> = ({ matchData }) => {
  const isMobile = useIsMobile();
  
  if (!matchData) {
    return (
      <p className="text-xs text-muted-foreground">No raw match data available</p>
    );
  }
  
  return (
    <ScrollArea className={`${isMobile ? 'h-[200px]' : 'h-[300px]'} rounded-md border`}>
      <div className="p-2">
        <pre className="whitespace-pre-wrap break-words text-xxs sm:text-xs">
          {JSON.stringify(matchData, null, 2)}
        </pre>
      </div>
    </ScrollArea>
  );
};

export default RawMatchData;
