
import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import { extractBasicInfo } from '../../utils/match/basicInfoExtractor';
import { extractTeamsAndWinner } from '../../utils/match/teamUtils';
import { extractPlayerStats } from '../../utils/match/playerStatsUtils';

interface DataExtractorProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const DataExtractor: React.FC<DataExtractorProps> = ({ displayInfo, matchData }) => {
  useEffect(() => {
    if (!matchData) return;
    
    console.log("DataExtractor processing match data");
    
    // Extract basic match info
    extractBasicInfo(matchData, displayInfo);
    
    // Extract teams info and determine winner using the correct algorithm
    extractTeamsAndWinner(matchData, displayInfo);
    
    // Extract player stats
    extractPlayerStats(matchData, displayInfo);
    
    console.log("Processed match data:", displayInfo);
    
  }, [matchData, displayInfo]);
  
  return null; // This component doesn't render anything
};

export default DataExtractor;
