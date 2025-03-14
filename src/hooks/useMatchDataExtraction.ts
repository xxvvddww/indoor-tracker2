
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
    
    // Extract basic match info
    extractBasicInfo(matchData, displayInfo);
    console.log("Basic info extracted:", { 
      title: displayInfo.title, 
      venue: displayInfo.venue, 
      date: displayInfo.date 
    });
    
    // Extract teams info first since player stats depend on it
    extractTeamsAndWinner(matchData, displayInfo);
    console.log("Teams extracted:", 
      displayInfo.teams?.length, 
      "Winner:", displayInfo.winner
    );
    
    // Extract player stats only after teams have been extracted
    if (displayInfo.teams && displayInfo.teams.length > 0) {
      extractPlayerStats(matchData, displayInfo);
      
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
