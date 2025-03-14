
import React from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import MatchWinner from './MatchWinner';
import PlayerStatistics from './PlayerStatistics';
import MatchHeader from './MatchHeader';
import DataExtractor from './DataExtractor';

interface MatchOverviewProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const MatchOverview: React.FC<MatchOverviewProps> = ({ displayInfo, matchData }) => {
  return (
    <div className="space-y-4">
      {/* This component extracts data from matchData and updates displayInfo */}
      <DataExtractor displayInfo={displayInfo} matchData={matchData} />
      
      {/* Match Winner Section */}
      <MatchWinner displayInfo={displayInfo} />

      {/* Match Details Section */}
      <MatchHeader displayInfo={displayInfo} />

      {/* Player Stats for Each Team */}
      <PlayerStatistics displayInfo={displayInfo} />
    </div>
  );
};

export default MatchOverview;
