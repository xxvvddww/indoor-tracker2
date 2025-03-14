
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails } from "../../types/cricket";
import { extractPlayerStatsFromMatch } from './playerStats/extractorService';

// Extract player statistics from match data
export const extractPlayerStats = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  console.log("playerStatsUtils: Delegating to specialized extractor service");
  
  // Initialize player stats object if needed
  displayInfo.playerStats = displayInfo.playerStats || {};
  
  // Call the specialized extractor service
  extractPlayerStatsFromMatch(matchData, displayInfo);
  
  // Log the results
  console.log("Player stats extraction complete, results:", Object.keys(displayInfo.playerStats).length, "teams");
  Object.keys(displayInfo.playerStats).forEach(teamId => {
    console.log(`Team ${teamId} has ${displayInfo.playerStats![teamId].players.length} players`);
  });
};
