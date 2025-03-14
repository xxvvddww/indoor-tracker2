
import { DisplayableMatchInfo } from '../../components/match/types';
import { MatchDetails, Team } from '../../types/cricket';

// Extract teams information
export const extractTeamsInfo = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  // Extract teams if not already set
  if ((!displayInfo.teams || displayInfo.teams.length === 0) && matchData.Teams?.Team) {
    console.log("Extracting team information");
    
    const teams = Array.isArray(matchData.Teams.Team) ? 
      matchData.Teams.Team : [matchData.Teams.Team];
      
    displayInfo.teams = teams.map(team => ({
      id: team.Id,
      name: team.Name,
      isWinner: false
    }));
    
    // Try to determine winner
    determineMatchWinner(matchData, displayInfo);
  }
};

// Determine the match winner from available data
export const determineMatchWinner = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  if (!displayInfo.teams || displayInfo.teams.length !== 2) return;
  
  // First try to get winner from Skins
  if (matchData.Skins?.Skin) {
    const skins = Array.isArray(matchData.Skins.Skin) ? 
      matchData.Skins.Skin : [matchData.Skins.Skin];
    
    if (skins.length > 0) {
      const lastSkin = skins[skins.length - 1];
      const team1Score = parseInt(lastSkin.Team1Score || '0') + parseInt(lastSkin.Team1BonusPenaltyRuns || '0');
      const team2Score = parseInt(lastSkin.Team2Score || '0') + parseInt(lastSkin.Team2BonusPenaltyRuns || '0');
      
      const team1Id = lastSkin.Team1Id;
      const team2Id = lastSkin.Team2Id;
      
      const team1 = displayInfo.teams.find(t => t.id === team1Id);
      const team2 = displayInfo.teams.find(t => t.id === team2Id);
      
      if (team1 && team2) {
        // Set result string
        displayInfo.result = `${team1.name}: ${team1Score} - ${team2.name}: ${team2Score}`;
        
        if (team1Score > team2Score) {
          displayInfo.winner = team1.name;
          displayInfo.winnerId = team1.id;
          displayInfo.teams.forEach(t => {
            if (t.id === team1.id) t.isWinner = true;
          });
        } else if (team2Score > team1Score) {
          displayInfo.winner = team2.name;
          displayInfo.winnerId = team2.id;
          displayInfo.teams.forEach(t => {
            if (t.id === team2.id) t.isWinner = true;
          });
        } else {
          displayInfo.winner = "Draw";
        }
      }
    }
  }
  
  // If no winner determined, try using Teams points
  if (!displayInfo.winner && matchData.Teams?.Team) {
    const teams = Array.isArray(matchData.Teams.Team) ? 
      matchData.Teams.Team : [matchData.Teams.Team];
    
    if (teams.length === 2 && teams[0].Points && teams[1].Points) {
      const team1Points = parseInt(teams[0].Points);
      const team2Points = parseInt(teams[1].Points);
      
      displayInfo.result = `${teams[0].Name}: ${team1Points} pts - ${teams[1].Name}: ${team2Points} pts`;
      
      if (team1Points > team2Points) {
        displayInfo.winner = teams[0].Name;
        displayInfo.winnerId = teams[0].Id;
        if (displayInfo.teams) displayInfo.teams[0].isWinner = true;
      } else if (team2Points > team1Points) {
        displayInfo.winner = teams[1].Name;
        displayInfo.winnerId = teams[1].Id;
        if (displayInfo.teams) displayInfo.teams[1].isWinner = true;
      } else {
        displayInfo.winner = "Draw";
      }
    }
  }
};
