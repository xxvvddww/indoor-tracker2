
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
  
  // Special case: handle array-like objects that have numeric keys
  if (data && typeof data === 'object' && Object.keys(data).some(key => !isNaN(Number(key)))) {
    console.log("Found array-like object in match data, attempting to process");
    
    // Try to find the first item that has useful data
    for (const key in data) {
      const item = data[key];
      if (item && typeof item === 'object') {
        // Recursively call extract with this item
        extractTeamsAndWinner(item as any, displayData);
        
        // If teams were extracted, we can stop processing
        if (displayData.teams && displayData.teams.length > 0) {
          console.log(`Successfully extracted teams from array item ${key}`);
          return;
        }
      }
    }
  }
  
  // Check if data is nested in a Statistics property
  if (data.Statistics && typeof data.Statistics === 'object') {
    console.log("Found nested Statistics object, processing it");
    extractTeamsAndWinner(data.Statistics as any, displayData);
    
    // If teams were extracted, we can stop processing
    if (displayData.teams && displayData.teams.length > 0) {
      console.log("Successfully extracted teams from nested Statistics");
      return;
    }
  }
  
  // Extract teams first
  const teamsData = extractTeams(data, displayData);
  
  if (!teamsData || teamsData.length === 0) {
    console.log("No teams data could be extracted from any source");
    
    // Create fallback teams even if no team data is found
    // This ensures we always have at least placeholder teams to display
    displayData.teams = [
      {
        id: "team1",
        name: "Team 1",
      },
      {
        id: "team2",
        name: "Team 2",
      }
    ];
    
    console.log("Added fallback teams:", displayData.teams);
    
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
