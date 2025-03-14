
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
    // First try to get player data from the array-like structure if present
    if (typeof matchData === 'object' && matchData['0']) {
      console.log("Found array-like match data, attempting to extract player stats from it");
      
      // Try to extract from each item in the array-like object
      for (const key in matchData) {
        if (!isNaN(Number(key))) {
          const item = matchData[key] as any;
          
          // Recursively call extract with this item
          if (item && typeof item === 'object') {
            extractPlayerStatsFromMatch(item, displayInfo);
            
            // Check if we got any players - if yes, we can stop processing
            const hasPlayers = Object.values(displayInfo.playerStats).some(
              team => team.players && team.players.length > 0 && 
                     !team.players[0].Name.includes("No player statistics")
            );
            
            if (hasPlayers) {
              console.log("Successfully extracted player stats from array item", key);
              return;
            }
          }
        }
      }
    }
    
    // Call the specialized extractor service with the full match data
    extractPlayerStatsFromMatch(matchData, displayInfo);
  } catch (error) {
    console.error("Error extracting player stats:", error);
  }
  
  // Check if extraction returned any usable player data
  let extractedValidPlayers = false;
  if (displayInfo.playerStats) {
    Object.keys(displayInfo.playerStats).forEach(teamId => {
      const team = displayInfo.playerStats![teamId];
      if (team.players && team.players.length > 0) {
        // Check if we have real player names (not placeholder text)
        extractedValidPlayers = team.players.some(p => 
          p.Name && !p.Name.includes("No player statistics")
        );
      }
    });
  }
  
  // Add fallback data if no players were found or if all players have placeholder text
  if (!extractedValidPlayers) {
    console.log("No real player data found, adding fallback players");
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
    
    // Skip if team already has real players
    if (displayInfo.playerStats![teamId].players.some(p => !p.Name.includes("No player statistics"))) {
      return;
    }
    
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
