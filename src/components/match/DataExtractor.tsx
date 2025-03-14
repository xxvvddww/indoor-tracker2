
import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import { extractBasicInfo } from '../../utils/match/basicInfoExtractor';
import { extractTeamsInfo } from '../../utils/match/teamsExtractor';
import { extractPlayerStats } from '../../utils/match/playerDataExtractor';

interface DataExtractorProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

/**
 * This component doesn't render anything visible - it just extracts data from the raw match data
 * and updates the displayInfo object if needed
 */
export const DataExtractor: React.FC<DataExtractorProps> = ({ displayInfo, matchData }) => {
  useEffect(() => {
    if (!matchData) return;
    
    console.log("DataExtractor processing match data");
    
    // Extract basic match info
    extractBasicInfo(matchData, displayInfo);
    
    // Extract teams info
    extractTeamsInfo(matchData, displayInfo);
    
    // Extract player stats
    extractPlayerStats(matchData, displayInfo);
    
  }, [matchData, displayInfo]);
  
  return null; // This component doesn't render anything
};

export default DataExtractor;
