
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails } from "../../types/cricket";

/**
 * Extracts teams information and determines the match winner
 */
export const extractTeamsAndWinner = (data: MatchDetails, displayData: DisplayableMatchInfo): void => {
  console.log("Starting team extraction and winner determination");
  
  // Extract teams first
  if (data.Teams && data.Teams.Team) {
    console.log("Extracting teams from Teams data");
    
    const teamsData = Array.isArray(data.Teams.Team) ? 
      data.Teams.Team : [data.Teams.Team];
    
    displayData.teams = teamsData.map(team => ({
      id: team.Id,
      name: team.Name,
      isWinner: false // Will be set by winner determination logic
    }));
    
    // Determine winner if we have points
    if (teamsData.length === 2) {
      const team1Points = parseInt(teamsData[0].Points || '0');
      const team2Points = parseInt(teamsData[1].Points || '0');
      
      if (team1Points > team2Points) {
        displayData.winner = teamsData[0].Name;
        displayData.winnerId = teamsData[0].Id;
        displayData.teams[0].isWinner = true;
      } else if (team2Points > team1Points) {
        displayData.winner = teamsData[1].Name;
        displayData.winnerId = teamsData[1].Id;
        displayData.teams[1].isWinner = true;
      }
    }
  } 
  // If no Teams data, check if we can use Configuration
  else if (data.Configuration) {
    const config = data.Configuration;
    
    // Check if we have team IDs
    if (config.Team1Id && config.Team2Id) {
      console.log("Using Configuration for team data");
      
      // Use team names if available, otherwise use IDs
      const team1Name = config.Team1Name || `Team 1 (${config.Team1Id})`;
      const team2Name = config.Team2Name || `Team 2 (${config.Team2Id})`;
      
      displayData.teams = [
        {
          id: config.Team1Id,
          name: team1Name,
          isWinner: false
        },
        {
          id: config.Team2Id,
          name: team2Name,
          isWinner: false
        }
      ];
      
      // Check if match has a winner
      if (config.MatchWinner) {
        // Set winner based on match winner
        if (config.MatchWinner === team1Name) {
          displayData.winner = team1Name;
          displayData.winnerId = config.Team1Id;
          displayData.teams[0].isWinner = true;
        } else if (config.MatchWinner === team2Name) {
          displayData.winner = team2Name;
          displayData.winnerId = config.Team2Id;
          displayData.teams[1].isWinner = true;
        }
      }
    }
  }
  // Last resort: Check if data is an array and the first element has Properties
  else if (Array.isArray(data) && data[0] && data[0].Properties) {
    console.log("Trying to extract team info from array data");
    
    // Create fallback teams
    displayData.teams = [
      {
        id: "team1",
        name: "Team 1",
        isWinner: false
      },
      {
        id: "team2",
        name: "Team 2",
        isWinner: false
      }
    ];
  }
  // If we have no other data sources, create generic teams
  else if (!displayData.teams || displayData.teams.length === 0) {
    console.log("No teams data available, creating generic teams");
    
    displayData.teams = [
      {
        id: "team1",
        name: "Home Team",
        isWinner: false
      },
      {
        id: "team2",
        name: "Away Team",
        isWinner: false
      }
    ];
  }

  console.log("Team extraction complete:", displayData.teams ? 
    displayData.teams.map(t => t.name).join(', ') : 
    "No teams");
  console.log("Winner determination complete:", displayData.winner);
};
