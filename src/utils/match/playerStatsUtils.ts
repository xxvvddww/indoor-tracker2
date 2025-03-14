
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails } from "../../types/cricket";
import { extractPlayerStatsFromMatch } from './playerStats/extractorService';

// Extract player statistics from match data
export const extractPlayerStats = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  console.log("playerStatsUtils: Starting player stats extraction");
  
  // Check if we have teams to work with
  if (!displayInfo.teams || displayInfo.teams.length === 0) {
    console.log("No teams in displayInfo, cannot proceed with player stats extraction");
    return;
  }
  
  // Initialize player stats object if needed
  displayInfo.playerStats = displayInfo.playerStats || {};
  
  // Initialize empty player arrays for each team
  displayInfo.teams.forEach(team => {
    if (!displayInfo.playerStats![team.id]) {
      displayInfo.playerStats![team.id] = {
        name: team.name,
        players: []
      };
    }
  });
  
  try {
    // Call the specialized extractor service
    extractPlayerStatsFromMatch(matchData, displayInfo);
  } catch (error) {
    console.error("Error extracting player stats:", error);
  }
  
  // Add fallback data if no players were found
  let totalPlayers = 0;
  Object.keys(displayInfo.playerStats).forEach(teamId => {
    totalPlayers += displayInfo.playerStats![teamId].players.length;
  });
  
  if (totalPlayers === 0) {
    console.log("No players found in actual data, adding fallback players");
    addFallbackPlayerStats(displayInfo);
  }
  
  // Log the results
  console.log("Player stats extraction complete, results:", Object.keys(displayInfo.playerStats).length, "teams");
  Object.keys(displayInfo.playerStats).forEach(teamId => {
    console.log(`Team ${teamId} has ${displayInfo.playerStats![teamId].players.length} players`);
  });
};

// Add fallback player data when no stats are available
const addFallbackPlayerStats = (displayInfo: DisplayableMatchInfo): void => {
  if (!displayInfo.teams || !displayInfo.playerStats) return;
  
  displayInfo.teams.forEach(team => {
    const teamId = team.id;
    
    // Skip if team already has players
    if (displayInfo.playerStats![teamId].players.length > 0) return;
    
    // Create a notice "player" to indicate no data
    displayInfo.playerStats![teamId].players = [
      {
        Name: "No player statistics available",
        RS: "-",
        OB: "-",
        RC: "-",
        Wkts: "-",
        SR: "-",
        Econ: "-"
      }
    ];
  });
};
