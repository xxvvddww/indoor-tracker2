
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails } from "../../types/cricket";
import { extractTeams } from "./teamExtractor";
import { determineWinnerFromPoints, determineWinnerFromSkins, determineStatusFromConfig } from "./winnerDeterminer";

/**
 * Extracts teams information and determines the match winner
 * Orchestrates the process of team extraction and winner determination
 */
export const extractTeamsAndWinner = (data: MatchDetails, displayData: DisplayableMatchInfo): void => {
  console.log("Starting team extraction and winner determination");
  
  // Extract teams first
  const teamsData = extractTeams(data, displayData);
  
  if (teamsData.length === 0) {
    console.log("No teams data could be extracted from any source");
    
    // Use fallback if available from Configuration
    if (data.Configuration && data.Configuration.Team1Id && data.Configuration.Team2Id) {
      console.log("Using Configuration for fallback team data");
      
      // Add fallback teams from configuration
      displayData.teams = [
        {
          id: data.Configuration.Team1Id,
          name: `Team 1 (ID: ${data.Configuration.Team1Id})`,
        },
        {
          id: data.Configuration.Team2Id,
          name: `Team 2 (ID: ${data.Configuration.Team2Id})`,
        }
      ];
      
      console.log("Added fallback teams from Configuration:", displayData.teams);
    }
    
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
  console.log("Final teams data:", displayData.teams ? 
    displayData.teams.map(t => `${t.name} (${t.id})`).join(', ') : 
    "No teams");
};
