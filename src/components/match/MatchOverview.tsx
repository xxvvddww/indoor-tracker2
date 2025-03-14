
import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import MatchWinner from './MatchWinner';
import PlayerStatistics from './PlayerStatistics';
import MatchHeader from './MatchHeader';
import DataExtractor from './DataExtractor';
import MatchTeams from './MatchTeams';
import { ResponsiveContainer } from '../ui/responsive-container';
import { AlertCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface MatchOverviewProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const MatchOverview: React.FC<MatchOverviewProps> = ({ displayInfo, matchData }) => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    console.log("MatchOverview rendering with displayInfo:", displayInfo);
    console.log("MatchOverview has matchData:", !!matchData);
    if (matchData) {
      console.log("MatchData keys:", Object.keys(matchData));
    }
  }, [displayInfo, matchData]);

  // Show message if we have match data but no meaningful display information
  const hasNoUsefulInfo = matchData && 
    (!displayInfo.teams || displayInfo.teams.length === 0) && 
    !displayInfo.date && 
    !displayInfo.venue && 
    !displayInfo.winner && 
    !displayInfo.manOfMatch;

  if (!matchData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-md space-y-2 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No match data available
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer spacing="md">
      {/* This component extracts data from matchData and updates displayInfo */}
      <DataExtractor displayInfo={displayInfo} matchData={matchData} />
      
      {/* Display Raw Match Data */}
      <div className="space-y-4 w-full">
        <h3 className="text-lg font-medium">Match Data</h3>
        <ScrollArea className={`${isMobile ? 'h-[300px]' : 'h-[600px]'} rounded-md border`}>
          <div className="p-4">
            <pre className="whitespace-pre-wrap break-words text-xxs sm:text-xs">
              {JSON.stringify(matchData, null, 2)}
            </pre>
          </div>
        </ScrollArea>
      </div>
      
      {/* We'll keep these components but they won't be visible for now */}
      <div className="hidden">
        <MatchWinner displayInfo={displayInfo} />
        <MatchTeams displayInfo={displayInfo} />
        <MatchHeader displayInfo={displayInfo} />
        <PlayerStatistics displayInfo={displayInfo} />
      </div>
    </ResponsiveContainer>
  );
};

export default MatchOverview;
