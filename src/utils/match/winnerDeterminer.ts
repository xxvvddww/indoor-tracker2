
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails, Team } from "../../types/cricket";

/**
 * Determines the match winner using team points (PRIMARY method)
 * @param displayData Display information to update with winner
 * @param teamsData Array of teams
 * @returns True if winner was determined, false otherwise
 */
export const determineWinnerFromPoints = (
  displayData: DisplayableMatchInfo, 
  teamsData: Team[]
): boolean => {
  if (teamsData.length !== 2) {
    console.log("Not exactly 2 teams found, can't determine winner from points");
    return false;
  }
  
  // Check if Points attribute exists on both teams
  if (!teamsData[0].Points && !teamsData[1].Points) {
    console.log("Missing Points data on teams");
    return false;
  }
  
  console.log("Determining winner from Points:", 
    teamsData[0].Name, teamsData[0].Points || "N/A", "vs", 
    teamsData[1].Name, teamsData[1].Points || "N/A");
  
  const team1Points = parseInt(teamsData[0].Points || '0');
  const team2Points = parseInt(teamsData[1].Points || '0');
  
  if (team1Points > team2Points) {
    displayData.winner = teamsData[0].Name;
    displayData.winnerId = teamsData[0].Id;
    if (displayData.teams) {
      displayData.teams[0].isWinner = true;
    }
    displayData.result = `${teamsData[0].Name} won by ${team1Points - team2Points} points`;
    return true;
  } else if (team2Points > team1Points) {
    displayData.winner = teamsData[1].Name;
    displayData.winnerId = teamsData[1].Id;
    if (displayData.teams) {
      displayData.teams[1].isWinner = true;
    }
    displayData.result = `${teamsData[1].Name} won by ${team2Points - team1Points} points`;
    return true;
  } else if (team1Points > 0 || team2Points > 0) {
    displayData.winner = "Draw";
    displayData.result = "Match ended in a draw";
    return true;
  }
  
  return false;
};

/**
 * Determines the match winner using skin scores (SECONDARY method)
 * @param data Match details from API
 * @param displayData Display information to update with winner
 * @param teamsData Array of teams
 * @returns True if winner was determined, false otherwise
 */
export const determineWinnerFromSkins = (
  data: MatchDetails, 
  displayData: DisplayableMatchInfo, 
  teamsData: Team[]
): boolean => {
  if (!data.Skins || !data.Skins.Skin || teamsData.length !== 2) {
    console.log("No Skins data available or not exactly 2 teams");
    return false;
  }
  
  const skins = Array.isArray(data.Skins.Skin) ? 
    data.Skins.Skin : [data.Skins.Skin];
  
  if (skins.length === 0) {
    return false;
  }
  
  console.log("Determining winner from Skins as fallback");
  
  const lastSkin = skins[skins.length - 1];
  
  // Use team scores from the skin
  const team1Score = parseInt(lastSkin.Team1Score || '0') + parseInt(lastSkin.Team1BonusPenaltyRuns || '0');
  const team2Score = parseInt(lastSkin.Team2Score || '0') + parseInt(lastSkin.Team2BonusPenaltyRuns || '0');
  
  // Try to match teams by ID to the Team1Id and Team2Id in the skin
  let team1Index = -1;
  let team2Index = -1;
  
  if (lastSkin.Team1Id && lastSkin.Team2Id) {
    team1Index = teamsData.findIndex(team => team.Id === lastSkin.Team1Id);
    team2Index = teamsData.findIndex(team => team.Id === lastSkin.Team2Id);
  }
  
  // If we can't find teams by ID, fall back to using index 0 and 1
  if (team1Index === -1) team1Index = 0;
  if (team2Index === -1) team2Index = 1;
  
  if (team1Score > team2Score) {
    displayData.winner = teamsData[team1Index].Name;
    displayData.winnerId = teamsData[team1Index].Id;
    if (displayData.teams && displayData.teams[team1Index]) {
      displayData.teams[team1Index].isWinner = true;
    }
    displayData.result = `${teamsData[team1Index].Name} won by ${team1Score - team2Score} runs`;
    return true;
  } else if (team2Score > team1Score) {
    displayData.winner = teamsData[team2Index].Name;
    displayData.winnerId = teamsData[team2Index].Id;
    if (displayData.teams && displayData.teams[team2Index]) {
      displayData.teams[team2Index].isWinner = true;
    }
    displayData.result = `${teamsData[team2Index].Name} won by ${team2Score - team1Score} runs`;
    return true;
  } else {
    displayData.winner = "Draw";
    displayData.result = "Match ended in a draw";
    return true;
  }
};

/**
 * Determines match status from Configuration if available
 * Fallback method when no winner could be determined from other sources
 */
export const determineStatusFromConfig = (
  data: MatchDetails, 
  displayData: DisplayableMatchInfo
): boolean => {
  if (!data.Configuration) {
    return false;
  }
  
  const config = data.Configuration as any;
  
  // Check if match has completed
  if (config.MatchStatus === "Complete" || config.MatchStatus === "Completed") {
    console.log("Match completed according to configuration");
    
    // Try to get winner from MatchWinner field if it exists
    if (config.MatchWinner && displayData.teams) {
      const winnerTeam = displayData.teams.find(team => 
        team.name.toLowerCase() === config.MatchWinner.toLowerCase());
      
      if (winnerTeam) {
        displayData.winner = winnerTeam.name;
        displayData.winnerId = winnerTeam.id;
        winnerTeam.isWinner = true;
        displayData.result = `${winnerTeam.name} won the match`;
        return true;
      }
    }
    
    // If we know it's complete but don't have a winner
    if (!displayData.winner) {
      displayData.winner = "Match Completed";
      displayData.result = "Match has been completed";
      return true;
    }
  } else if (config.MatchStatus === "In Progress") {
    displayData.winner = "In Progress";
    displayData.result = "Match is currently in progress";
    return true;
  } else if (config.MatchStatus === "Abandoned" || config.MatchStatus === "Cancelled") {
    displayData.winner = "Match Abandoned";
    displayData.result = "Match was abandoned or cancelled";
    return true;
  } else if (config.MatchStatus) {
    displayData.winner = config.MatchStatus;
    displayData.result = `Match status: ${config.MatchStatus}`;
    return true;
  }
  
  return false;
};
