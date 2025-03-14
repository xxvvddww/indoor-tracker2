
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails, Team } from "../../types/cricket";

/**
 * Extracts teams information from match data and adds it to the display data
 * @param data Match details from API
 * @param displayData Display information to update
 * @returns Array of teams if available, empty array otherwise
 */
export const extractTeams = (data: MatchDetails, displayData: DisplayableMatchInfo): Team[] => {
  // Special case: handle array-like objects that have numeric keys
  // This happens when the API returns array-like objects instead of proper arrays
  if (data && typeof data === 'object' && Object.keys(data).every(key => !isNaN(Number(key)))) {
    console.log("Found array-like object in match data, attempting to process");
    
    // Try to find the first item that has useful data
    for (const key in data) {
      const item = data[key];
      if (item && typeof item === 'object') {
        // Recursively call extract with this item
        const result = extractTeams(item as any, displayData);
        if (result.length > 0) {
          return result;
        }
      }
    }
  }
  
  // First check for Teams structure
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
  
  // If no Teams data, try extracting from Skins
  if (data.Skins && data.Skins.Skin) {
    console.log("No Teams data, trying to extract from Skins");
    const skins = Array.isArray(data.Skins.Skin) ? 
      data.Skins.Skin : [data.Skins.Skin];
    
    if (skins.length > 0) {
      const lastSkin = skins[skins.length - 1];
      
      // Only proceed if we have team IDs and names
      if (lastSkin.Team1Id && lastSkin.Team2Id && lastSkin.Team1Name && lastSkin.Team2Name) {
        console.log("Found team info in Skins data");
        
        displayData.teams = [
          {
            id: lastSkin.Team1Id,
            name: lastSkin.Team1Name,
            isWinner: false
          },
          {
            id: lastSkin.Team2Id,
            name: lastSkin.Team2Name,
            isWinner: false
          }
        ];
        
        // Create mock team objects to return
        return [
          { Id: lastSkin.Team1Id, Name: lastSkin.Team1Name } as Team,
          { Id: lastSkin.Team2Id, Name: lastSkin.Team2Name } as Team
        ];
      }
    }
  }
  
  // Fallback: Check if we have Configuration with team names
  if (data.Configuration) {
    const config = data.Configuration as any;
    
    // Check for Team1Name, Team2Name or similar fields
    const team1Name = config.Team1Name || config.Home || config.HomeTeam;
    const team2Name = config.Team2Name || config.Away || config.AwayTeam;
    
    if (team1Name && team2Name) {
      console.log("Extracting teams from Configuration");
      
      // Generate unique IDs if not available
      const team1Id = config.Team1Id || config.HomeId || "team1";
      const team2Id = config.Team2Id || config.AwayId || "team2";
      
      displayData.teams = [
        {
          id: team1Id,
          name: team1Name,
          isWinner: false
        },
        {
          id: team2Id,
          name: team2Name,
          isWinner: false
        }
      ];
      
      // Create mock team objects to return
      return [
        { Id: team1Id, Name: team1Name } as Team,
        { Id: team2Id, Name: team2Name } as Team
      ];
    }
  }
  
  // Try to find any data that looks like teams
  if (data.Team1 && data.Team2) {
    console.log("Found Team1/Team2 objects in data");
    
    const team1Name = typeof data.Team1 === 'string' ? data.Team1 : (data.Team1.Name || "Team 1");
    const team2Name = typeof data.Team2 === 'string' ? data.Team2 : (data.Team2.Name || "Team 2");
    
    const team1Id = typeof data.Team1 === 'object' && data.Team1.Id ? data.Team1.Id : "team1";
    const team2Id = typeof data.Team2 === 'object' && data.Team2.Id ? data.Team2.Id : "team2";
    
    displayData.teams = [
      {
        id: team1Id,
        name: team1Name,
        isWinner: false
      },
      {
        id: team2Id,
        name: team2Name,
        isWinner: false
      }
    ];
    
    return [
      { Id: team1Id, Name: team1Name } as Team,
      { Id: team2Id, Name: team2Name } as Team
    ];
  }
  
  console.log("No Teams data available from any source");
  return [];
};
