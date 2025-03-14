
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails, Team } from "../../types/cricket";

// Extract teams information and determine winner
export const extractTeamsAndWinner = (data: MatchDetails, displayData: DisplayableMatchInfo): void => {
  if (!data.Teams || !data.Teams.Team) return;
  
  const teamsData = Array.isArray(data.Teams.Team) ? 
    data.Teams.Team : [data.Teams.Team];
  
  displayData.teams = teamsData.map(team => ({
    id: team.Id,
    name: team.Name,
    isWinner: false // Will set later
  }));
  
  // First try to determine winner from team points (the most reliable method)
  determineWinnerFromPoints(displayData, teamsData);
  
  // If winner couldn't be determined from points, try using skins
  if (!displayData.winner) {
    determineWinnerFromSkins(data, displayData, teamsData);
  }
};

// Determine winner based on team points (PRIMARY method)
const determineWinnerFromPoints = (
  displayData: DisplayableMatchInfo, 
  teamsData: Team[]
): void => {
  if (teamsData.length !== 2 || !teamsData[0]?.Points || !teamsData[1]?.Points) return;
  
  console.log("Determining winner from Points:", teamsData[0].Name, teamsData[0].Points, "vs", teamsData[1].Name, teamsData[1].Points);
  
  const team1Points = parseInt(teamsData[0].Points || '0');
  const team2Points = parseInt(teamsData[1].Points || '0');
  
  if (team1Points > team2Points) {
    displayData.winner = teamsData[0].Name;
    displayData.winnerId = teamsData[0].Id;
    if (displayData.teams) displayData.teams[0].isWinner = true;
    displayData.result = `${teamsData[0].Name} won by ${team1Points - team2Points} points`;
  } else if (team2Points > team1Points) {
    displayData.winner = teamsData[1].Name;
    displayData.winnerId = teamsData[1].Id;
    if (displayData.teams) displayData.teams[1].isWinner = true;
    displayData.result = `${teamsData[1].Name} won by ${team2Points - team1Points} points`;
  } else {
    displayData.winner = "Draw";
    displayData.result = "Match ended in a draw";
  }
};

// Determine winner based on skin scores (SECONDARY method)
const determineWinnerFromSkins = (
  data: MatchDetails, 
  displayData: DisplayableMatchInfo, 
  teamsData: Team[]
): void => {
  if (!data.Skins || !data.Skins.Skin || teamsData.length !== 2) return;
  
  const skins = Array.isArray(data.Skins.Skin) ? 
    data.Skins.Skin : [data.Skins.Skin];
  
  if (skins.length > 0) {
    const lastSkin = skins[skins.length - 1];
    const team1Score = parseInt(lastSkin.Team1Score || '0') + parseInt(lastSkin.Team1BonusPenaltyRuns || '0');
    const team2Score = parseInt(lastSkin.Team2Score || '0') + parseInt(lastSkin.Team2BonusPenaltyRuns || '0');
    
    if (team1Score > team2Score) {
      displayData.winner = teamsData[0].Name;
      displayData.winnerId = teamsData[0].Id;
      if (displayData.teams) displayData.teams[0].isWinner = true;
      displayData.result = `${teamsData[0].Name} won by ${team1Score - team2Score} runs`;
    } else if (team2Score > team1Score) {
      displayData.winner = teamsData[1].Name;
      displayData.winnerId = teamsData[1].Id;
      if (displayData.teams) displayData.teams[1].isWinner = true;
      displayData.result = `${teamsData[1].Name} won by ${team2Score - team1Score} runs`;
    } else {
      displayData.winner = "Draw";
      displayData.result = "Match ended in a draw";
    }
  }
};
