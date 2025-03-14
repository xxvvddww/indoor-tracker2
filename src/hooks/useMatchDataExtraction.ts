
import { useEffect } from 'react';
import { DisplayableMatchInfo } from '../components/match/types';
import { MatchDetails } from '../types/cricket';
import { extractBasicInfo } from '../utils/match/basicInfoExtractor';
import { extractTeamsAndWinner } from '../utils/match/teamUtils';
import { extractPlayerStats } from '../utils/match/playerStatsUtils';

/**
 * Custom hook to handle match data extraction logic
 * @param matchData Raw match data from API
 * @param displayInfo Display information object to be updated
 */
export const useMatchDataExtraction = (
  matchData: MatchDetails | null,
  displayInfo: DisplayableMatchInfo
): void => {
  useEffect(() => {
    if (!matchData) {
      console.log("No match data available for extraction");
      return;
    }
    
    console.log("useMatchDataExtraction processing match data");
    console.log("Raw match data keys:", Object.keys(matchData));
    
    // First, check if we're dealing with an array-like object
    // that needs special processing
    let dataToProcess = matchData;
    
    // Special case handling for array-like structure
    if (typeof matchData === 'object' && Object.keys(matchData).every(key => !isNaN(Number(key)))) {
      console.log("Found array-like match data structure, will process each item");
      
      // Try each array item for extraction
      for (const key in matchData) {
        const item = matchData[key];
        if (item && typeof item === 'object') {
          console.log(`Processing array item ${key}`);
          
          // Extract basic match info
          extractBasicInfo(item as any, displayInfo);
          
          // Extract teams info
          extractTeamsAndWinner(item as any, displayInfo);
          
          // If we have teams, stop processing other array items
          if (displayInfo.teams && displayInfo.teams.length > 0) {
            console.log(`Successfully extracted teams from array item ${key}, using it for further processing`);
            dataToProcess = item as any;
            break;
          }
        }
      }
    }
    
    // Extract basic match info
    extractBasicInfo(dataToProcess, displayInfo);
    console.log("Basic info extraction complete:", displayInfo);
    
    // Extract teams info first since player stats depend on it
    extractTeamsAndWinner(dataToProcess, displayInfo);
    console.log("Teams extracted:", 
      displayInfo.teams?.length, 
      "Winner:", displayInfo.winner
    );
    
    // Extract player stats only after teams have been extracted
    if (displayInfo.teams && displayInfo.teams.length > 0) {
      extractPlayerStats(dataToProcess, displayInfo);
      
      // Debug what we ended up with
      if (displayInfo.playerStats) {
        console.log("Final player stats:", Object.keys(displayInfo.playerStats).length, "teams");
        Object.keys(displayInfo.playerStats).forEach(teamId => {
          console.log(`Team ${teamId} has ${displayInfo.playerStats![teamId].players.length} players`);
        });
      } else {
        console.log("No player stats were extracted during the process");
      }
    } else {
      console.log("Skipping player stats extraction because no teams were found");
    }
  }, [matchData, displayInfo]);
};

export default useMatchDataExtraction;
