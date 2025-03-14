
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails, Team } from "../../types/cricket";

/**
 * Extracts teams information from match data and adds it to the display data
 * @param data Match details from API
 * @param displayData Display information to update
 * @returns Array of teams if available, empty array otherwise
 */
export const extractTeams = (data: MatchDetails, displayData: DisplayableMatchInfo): Team[] => {
  if (!data.Teams || !data.Teams.Team) {
    console.log("No Teams data available");
    return [];
  }
  
  console.log("Extracting teams from data:", data.Teams);
  
  const teamsData = Array.isArray(data.Teams.Team) ? 
    data.Teams.Team : [data.Teams.Team];
  
  displayData.teams = teamsData.map(team => ({
    id: team.Id,
    name: team.Name,
    isWinner: false // Will be set by winner determination logic
  }));
  
  return teamsData;
};
