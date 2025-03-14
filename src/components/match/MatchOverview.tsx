
import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import MatchWinner from './MatchWinner';
import PlayerStatistics from './PlayerStatistics';
import MatchHeader from './MatchHeader';
import DataExtractor from './DataExtractor';
import MatchTeams from './MatchTeams';
import { ResponsiveContainer } from '../ui/responsive-container';

interface MatchOverviewProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const MatchOverview: React.FC<MatchOverviewProps> = ({ displayInfo, matchData }) => {
  useEffect(() => {
    console.log("MatchOverview rendering with displayInfo:", displayInfo);
  }, [displayInfo]);

  return (
    <ResponsiveContainer spacing="md">
      {/* This component extracts data from matchData and updates displayInfo */}
      <DataExtractor displayInfo={displayInfo} matchData={matchData} />
      
      {/* Match Winner Section */}
      <MatchWinner displayInfo={displayInfo} />

      {/* Teams Information */}
      <MatchTeams displayInfo={displayInfo} />

      {/* Match Details Section */}
      <MatchHeader displayInfo={displayInfo} />

      {/* Player Stats for Each Team */}
      <PlayerStatistics displayInfo={displayInfo} />
    </ResponsiveContainer>
  );
};

export default MatchOverview;
