
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
  if (!teamsData[0].Points || !teamsData[1].Points) {
    console.log("Missing Points data on teams");
    return false;
  }
  
  console.log("Determining winner from Points:", 
    teamsData[0].Name, teamsData[0].Points, "vs", 
    teamsData[1].Name, teamsData[1].Points);
  
  const team1Points = parseInt(teamsData[0].Points || '0');
  const team2Points = parseInt(teamsData[1].Points || '0');
  
  if (team1Points > team2Points) {
    displayData.winner = teamsData[0].Name;
    displayData.winnerId = teamsData[0].Id;
    if (displayData.teams) displayData.teams[0].isWinner = true;
    displayData.result = `${teamsData[0].Name} won by ${team1Points - team2Points} points`;
    return true;
  } else if (team2Points > team1Points) {
    displayData.winner = teamsData[1].Name;
    displayData.winnerId = teamsData[1].Id;
    if (displayData.teams) displayData.teams[1].isWinner = true;
    displayData.result = `${teamsData[1].Name} won by ${team2Points - team1Points} points`;
    return true;
  } else {
    displayData.winner = "Draw";
    displayData.result = "Match ended in a draw";
    return true;
  }
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
  const team1Score = parseInt(lastSkin.Team1Score || '0') + parseInt(lastSkin.Team1BonusPenaltyRuns || '0');
  const team2Score = parseInt(lastSkin.Team2Score || '0') + parseInt(lastSkin.Team2BonusPenaltyRuns || '0');
  
  if (team1Score > team2Score) {
    displayData.winner = teamsData[0].Name;
    displayData.winnerId = teamsData[0].Id;
    if (displayData.teams) displayData.teams[0].isWinner = true;
    displayData.result = `${teamsData[0].Name} won by ${team1Score - team2Score} runs`;
    return true;
  } else if (team2Score > team1Score) {
    displayData.winner = teamsData[1].Name;
    displayData.winnerId = teamsData[1].Id;
    if (displayData.teams) displayData.teams[1].isWinner = true;
    displayData.result = `${teamsData[1].Name} won by ${team2Score - team1Score} runs`;
    return true;
  } else {
    displayData.winner = "Draw";
    displayData.result = "Match ended in a draw";
    return true;
  }
};
