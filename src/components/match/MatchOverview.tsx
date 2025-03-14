
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

interface MatchOverviewProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const MatchOverview: React.FC<MatchOverviewProps> = ({ displayInfo, matchData }) => {
  useEffect(() => {
    console.log("MatchOverview rendering with displayInfo:", displayInfo);
  }, [displayInfo]);

  // Show message if we have match data but no meaningful display information
  const hasNoUsefulInfo = matchData && 
    (!displayInfo.teams || displayInfo.teams.length === 0) && 
    !displayInfo.date && 
    !displayInfo.venue && 
    !displayInfo.winner && 
    !displayInfo.manOfMatch;

  return (
    <ResponsiveContainer spacing="md">
      {/* This component extracts data from matchData and updates displayInfo */}
      <DataExtractor displayInfo={displayInfo} matchData={matchData} />
      
      {hasNoUsefulInfo ? (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-md space-y-2 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            This match has limited or no data available
          </p>
        </div>
      ) : (
        <>
          {/* Match Winner Section */}
          <MatchWinner displayInfo={displayInfo} />

          {/* Teams Information */}
          <MatchTeams displayInfo={displayInfo} />

          {/* Match Details Section */}
          <MatchHeader displayInfo={displayInfo} />

          {/* Player Stats for Each Team */}
          <PlayerStatistics displayInfo={displayInfo} />
        </>
      )}
    </ResponsiveContainer>
  );
};

export default MatchOverview;
