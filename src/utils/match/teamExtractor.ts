
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails, Team } from "../../types/cricket";

/**
 * Extracts teams information from match data and adds it to the display data
 * @param data Match details from API
 * @param displayData Display information to update
 * @returns Array of teams if available, empty array otherwise
 */
export const extractTeams = (data: MatchDetails, displayData: DisplayableMatchInfo): Team[] => {
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
    if (config.Team1Name && config.Team2Name) {
      console.log("Extracting teams from Configuration");
      
      // Generate unique IDs if not available
      const team1Id = config.Team1Id || "team1";
      const team2Id = config.Team2Id || "team2";
      
      displayData.teams = [
        {
          id: team1Id,
          name: config.Team1Name,
          isWinner: false
        },
        {
          id: team2Id,
          name: config.Team2Name,
          isWinner: false
        }
      ];
      
      // Create mock team objects to return
      return [
        { Id: team1Id, Name: config.Team1Name } as Team,
        { Id: team2Id, Name: config.Team2Name } as Team
      ];
    }
  }
  
  console.log("No Teams data available from any source");
  return [];
};
