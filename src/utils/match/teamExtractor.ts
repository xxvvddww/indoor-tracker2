
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails, Team } from "../../types/cricket";

/**
 * Extracts teams information from match data and adds it to the display data
 * @param data Match details from API
 * @param displayData Display information to update
 * @returns Array of teams if available, empty array otherwise
 */
export const extractTeams = (data: MatchDetails, displayData: DisplayableMatchInfo): Team[] => {
  // First check if we're dealing with a simple array structure (common in some responses)
  if (Array.isArray(data) && data.length > 0) {
    console.log("Extracting teams from array data");
    
    // Try to get team info from Properties
    const matchData = data[0];
    if (matchData.Properties) {
      // Extract team info from Properties
      const homeTeamId = matchData.Properties.Team1Id || "team1";
      const awayTeamId = matchData.Properties.Team2Id || "team2";
      const homeTeamName = matchData.Properties.Team1Name || "Home Team";
      const awayTeamName = matchData.Properties.Team2Name || "Away Team";
      
      displayData.teams = [
        {
          id: homeTeamId,
          name: homeTeamName,
          isWinner: false
        },
        {
          id: awayTeamId,
          name: awayTeamName,
          isWinner: false
        }
      ];
      
      // Create mock team objects to return
      return [
        { Id: homeTeamId, Name: homeTeamName } as Team,
        { Id: awayTeamId, Name: awayTeamName } as Team
      ];
    }
    
    // Try to get team info from Players
    if (matchData.Players && matchData.Players.Player) {
      const players = Array.isArray(matchData.Players.Player) ? 
        matchData.Players.Player : [matchData.Players.Player];
      
      // Extract unique teams from players
      const teamMap = new Map<string, {id: string, name: string}>();
      
      players.forEach(player => {
        if (player.TeamId && player.TeamName) {
          teamMap.set(player.TeamId, {
            id: player.TeamId,
            name: player.TeamName
          });
        }
      });
      
      if (teamMap.size > 0) {
        displayData.teams = Array.from(teamMap.values()).map(team => ({
          id: team.id,
          name: team.name,
          isWinner: false
        }));
        
        // Create team objects to return
        return Array.from(teamMap.values()).map(team => ({
          Id: team.id,
          Name: team.name
        } as Team));
      }
    }
  }
  
  // Standard approach: check for Teams structure
  if (data.Teams && data.Teams.Team) {
    console.log("Extracting teams from Teams data");
    
    const teamsData = Array.isArray(data.Teams.Team) ? 
      data.Teams.Team : [data.Teams.Team];
    
    displayData.teams = teamsData.map(team => ({
      id: team.Id,
      name: team.Name,
      isWinner: false // Will be set by winner determination logic
    }));
    
    return teamsData;
  }
  
  // Check for Properties with team info
  if (data.Properties) {
    const props = data.Properties;
    if (props.Team1Id && props.Team2Id) {
      const team1Name = props.Team1Name || `Team 1`;
      const team2Name = props.Team2Name || `Team 2`;
      
      displayData.teams = [
        {
          id: props.Team1Id,
          name: team1Name,
          isWinner: false
        },
        {
          id: props.Team2Id,
          name: team2Name,
          isWinner: false
        }
      ];
      
      // Create team objects to return
      return [
        { Id: props.Team1Id, Name: team1Name } as Team,
        { Id: props.Team2Id, Name: team2Name } as Team
      ];
    }
  }
  
  // If no Teams data, try extracting from Skins
  if (data.Skins && data.Skins.Skin) {
    console.log("No Teams data, trying to extract from Skins");
    const skins = Array.isArray(data.Skins.Skin) ? 
      data.Skins.Skin : [data.Skins.Skin];
    
    if (skins.length > 0) {
      const lastSkin = skins[skins.length - 1];
      
      // Only proceed if we have team IDs and names
      if (lastSkin.Team1Id && lastSkin.Team2Id) {
        console.log("Found team info in Skins data");
        
        const team1Name = lastSkin.Team1Name || `Team ${lastSkin.Team1Id}`;
        const team2Name = lastSkin.Team2Name || `Team ${lastSkin.Team2Id}`;
        
        displayData.teams = [
          {
            id: lastSkin.Team1Id,
            name: team1Name,
            isWinner: false
          },
          {
            id: lastSkin.Team2Id,
            name: team2Name,
            isWinner: false
          }
        ];
        
        // Create mock team objects to return
        return [
          { Id: lastSkin.Team1Id, Name: team1Name } as Team,
          { Id: lastSkin.Team2Id, Name: team2Name } as Team
        ];
      }
    }
  }
  
  // Fallback: Check if we have Configuration with team names
  if (data.Configuration) {
    const config = data.Configuration;
    if (config.Team1Id && config.Team2Id) {
      console.log("Extracting teams from Configuration");
      
      // Use team names if available, otherwise use IDs
      const team1Name = config.Team1Name || `Team ${config.Team1Id}`;
      const team2Name = config.Team2Name || `Team ${config.Team2Id}`;
      
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
      
      // Create mock team objects to return
      return [
        { Id: config.Team1Id, Name: team1Name } as Team,
        { Id: config.Team2Id, Name: team2Name } as Team
      ];
    }
  }
  
  // Last resort: Try to find Players data
  if (data.Players && data.Players.Player) {
    console.log("Extracting teams from Players data");
    
    const players = Array.isArray(data.Players.Player) ? 
      data.Players.Player : [data.Players.Player];
    
    // Extract unique teams from players
    const teamMap = new Map<string, {id: string, name: string}>();
    
    players.forEach(player => {
      if (player.TeamId && player.TeamName) {
        teamMap.set(player.TeamId, {
          id: player.TeamId,
          name: player.TeamName
        });
      }
    });
    
    if (teamMap.size > 0) {
      displayData.teams = Array.from(teamMap.values()).map(team => ({
        id: team.id,
        name: team.name,
        isWinner: false
      }));
      
      // Create team objects to return
      return Array.from(teamMap.values()).map(team => ({
        Id: team.id,
        Name: team.name
      } as Team));
    }
  }
  
  // If all else fails, create generic teams
  console.log("No Teams data available from any source, creating generic teams");
  displayData.teams = [
    { id: "team1", name: "Home Team", isWinner: false },
    { id: "team2", name: "Away Team", isWinner: false }
  ];
  
  return [
    { Id: "team1", Name: "Home Team" } as Team,
    { Id: "team2", Name: "Away Team" } as Team
  ];
};
