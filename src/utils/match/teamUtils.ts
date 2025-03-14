
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails } from "../../types/cricket";
import { extractTeams } from "./teamExtractor";
import { determineWinnerFromPoints, determineWinnerFromSkins } from "./winnerDeterminer";

/**
 * Extracts teams information and determines the match winner
 * Orchestrates the process of team extraction and winner determination
 */
export const extractTeamsAndWinner = (data: MatchDetails, displayData: DisplayableMatchInfo): void => {
  // Extract teams first
  const teamsData = extractTeams(data, displayData);
  
  if (teamsData.length === 0) {
    return;
  }
  
  // PRIORITY: determine winner from team points (the most reliable method)
  const winnerFromPoints = determineWinnerFromPoints(displayData, teamsData);
  
  // FALLBACK: If winner couldn't be determined from points, try using skins
  if (!winnerFromPoints) {
    determineWinnerFromSkins(data, displayData, teamsData);
  }

  console.log("Winner determined:", displayData.winner, "with ID:", displayData.winnerId);
};
