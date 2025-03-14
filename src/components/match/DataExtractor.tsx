
import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import { formatDate } from '../../utils/dateFormatters';
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

// Helper function for basic info extraction
const extractBasicInfo = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo) => {
  // Set title using Teams data if available
  if (!displayInfo.title || displayInfo.title === "Match Information") {
    const teams = matchData.Teams?.Team;
    if (teams && Array.isArray(teams) && teams.length >= 2) {
      displayInfo.title = `${teams[0].Name} vs ${teams[1].Name}`;
    }
  }
  
  // Try to get venue from Configuration
  if (!displayInfo.venue && matchData.Configuration) {
    if ((matchData.Configuration as any)?.PlayingAreaName) {
      displayInfo.venue = (matchData.Configuration as any).PlayingAreaName;
    }
  }
  
  // Try to get and format date from Configuration
  if (!displayInfo.date && matchData.Configuration) {
    try {
      const startTimeStr = (matchData.Configuration as any)?.Team1InningsStartTime;
      if (startTimeStr && typeof startTimeStr === 'string') {
        displayInfo.date = formatDate(startTimeStr);
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  }
};

export default DataExtractor;
