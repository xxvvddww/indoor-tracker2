
import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import { extractBasicInfo } from '../../utils/match/basicInfoExtractor';
import { extractTeamsAndWinner } from '../../utils/match/teamUtils';
import { extractPlayerStatsFromMatch } from '../../utils/match/playerStats/extractorService';

interface DataExtractorProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const DataExtractor: React.FC<DataExtractorProps> = ({ displayInfo, matchData }) => {
  useEffect(() => {
    if (!matchData) {
      console.log("No match data available for extraction");
      return;
    }
    
    console.log("DataExtractor processing match data");
    
    // Extract basic match info
    extractBasicInfo(matchData, displayInfo);
    console.log("Basic info extracted:", { title: displayInfo.title, venue: displayInfo.venue, date: displayInfo.date });
    
    // Extract teams info and determine winner using the correct algorithm
    extractTeamsAndWinner(matchData, displayInfo);
    console.log("Teams extracted:", displayInfo.teams?.length, "Winner:", displayInfo.winner);
    
    // Extract player stats directly from the specialized service
    // Use the extractorService directly to avoid any middleware issues
    extractPlayerStatsFromMatch(matchData, displayInfo);
    
    // Debug what we ended up with
    if (displayInfo.playerStats) {
      console.log("Final player stats:", Object.keys(displayInfo.playerStats).length, "teams");
      Object.keys(displayInfo.playerStats).forEach(teamId => {
        console.log(`Team ${teamId} has ${displayInfo.playerStats![teamId].players.length} players`);
      });
    } else {
      console.log("No player stats object was created during extraction");
    }
    
  }, [matchData, displayInfo]);
  
  return null; // This component doesn't render anything
};

export default DataExtractor;
