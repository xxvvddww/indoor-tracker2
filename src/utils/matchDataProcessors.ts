
import { DisplayableMatchInfo } from "../components/match/types";
import { MatchDetails } from "../types/cricket";
import { initializeDisplayData, extractVenueInfo, extractDateInfo } from "./match/displayDataUtils";
import { extractTeamsAndWinner } from "./match/teamUtils";
import { extractPlayerStats } from "./match/playerStatsUtils";

export const processMatchData = (data: MatchDetails | null): DisplayableMatchInfo => {
  if (!data) {
    return { title: "Match Information" };
  }
  
  // Initialize display data structure
  const displayData = initializeDisplayData(data);
  
  // Extract venue information
  extractVenueInfo(data, displayData);
  
  // Extract match date
  extractDateInfo(data, displayData);
  
  // Extract teams and determine winner
  extractTeamsAndWinner(data, displayData);
  
  // Extract player statistics
  extractPlayerStats(data, displayData);
  
  return displayData;
};
