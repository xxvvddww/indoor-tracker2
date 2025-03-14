
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails } from "../../types/cricket";
import { extractTeams } from "./teamExtractor";
import { determineWinnerFromPoints, determineWinnerFromSkins, determineStatusFromConfig } from "./winnerDeterminer";

/**
 * Extracts teams information and determines the match winner
 * Orchestrates the process of team extraction and winner determination
 */
export const extractTeamsAndWinner = (data: MatchDetails, displayData: DisplayableMatchInfo): void => {
  // Extract teams first
  const teamsData = extractTeams(data, displayData);
  
  if (teamsData.length === 0) {
    console.log("No teams data could be extracted from any source");
    
    // If we have configuration data, try to set a default status
    determineStatusFromConfig(data, displayData);
    return;
  }
  
  // Determine winner using various methods
  console.log("Trying to determine winner using points");
  const winnerFromPoints = determineWinnerFromPoints(displayData, teamsData);
  
  if (!winnerFromPoints) {
    console.log("Couldn't determine winner from points, trying skins");
    const winnerFromSkins = determineWinnerFromSkins(data, displayData, teamsData);
    
    if (!winnerFromSkins) {
      console.log("Couldn't determine winner from skins, checking configuration");
      determineStatusFromConfig(data, displayData);
    }
  }

  console.log("Winner determination complete:", displayData.winner, "with ID:", displayData.winnerId);
};
