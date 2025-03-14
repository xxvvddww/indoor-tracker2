
import { MatchDetails } from "../types/cricket";
import { DisplayableMatchInfo } from "../components/match/types";

export const processMatchData = (data: MatchDetails | null): DisplayableMatchInfo => {
  if (!data) {
    return { title: "Match Information" };
  }
  
  const displayData: DisplayableMatchInfo = { 
    title: "Match Information",
    playerStats: {},
    teams: []
  };
  
  // Extract teams first
  if (data.Teams && data.Teams.Team) {
    const teamsData = Array.isArray(data.Teams.Team) ? 
      data.Teams.Team : [data.Teams.Team];
    
    displayData.teams = teamsData.map(team => ({
      id: team.Id,
      name: team.Name,
      isWinner: false // Will set later
    }));
    
    // Try to determine winner
    if (data.Skins && data.Skins.Skin) {
      const skins = Array.isArray(data.Skins.Skin) ? 
        data.Skins.Skin : [data.Skins.Skin];
      
      if (skins.length > 0 && teamsData.length === 2) {
        const lastSkin = skins[skins.length - 1];
        const team1Score = parseInt(lastSkin.Team1Score || '0') + parseInt(lastSkin.Team1BonusPenaltyRuns || '0');
        const team2Score = parseInt(lastSkin.Team2Score || '0') + parseInt(lastSkin.Team2BonusPenaltyRuns || '0');
        
        if (team1Score > team2Score) {
          displayData.winner = teamsData[0].Name;
          displayData.winnerId = teamsData[0].Id;
          if (displayData.teams) displayData.teams[0].isWinner = true;
        } else if (team2Score > team1Score) {
          displayData.winner = teamsData[1].Name;
          displayData.winnerId = teamsData[1].Id;
          if (displayData.teams) displayData.teams[1].isWinner = true;
        } else {
          displayData.winner = "Draw";
        }
      }
    } else if (teamsData[0]?.Points && teamsData[1]?.Points) {
      // Alternative way to determine winner based on points
      const team1Points = parseInt(teamsData[0].Points || '0');
      const team2Points = parseInt(teamsData[1].Points || '0');
      
      if (team1Points > team2Points) {
        displayData.winner = teamsData[0].Name;
        displayData.winnerId = teamsData[0].Id;
        if (displayData.teams) displayData.teams[0].isWinner = true;
      } else if (team2Points > team1Points) {
        displayData.winner = teamsData[1].Name;
        displayData.winnerId = teamsData[1].Id;
        if (displayData.teams) displayData.teams[1].isWinner = true;
      } else {
        displayData.winner = "Draw";
      }
    }
  }
  
  // Extract player stats
  if (data.MatchSummary && data.MatchSummary.team) {
    const teams = Array.isArray(data.MatchSummary.team) ? 
      data.MatchSummary.team : [data.MatchSummary.team];
    
    teams.forEach(team => {
      // Fix for type error: Check if team has id property before using it
      const teamId = 'id' in team ? team.id : '';
      const teamName = 'name' in team ? team.name : '';
      
      if (teamId && teamName) {
        const players = Array.isArray(team.player) ? team.player : team.player ? [team.player] : [];
        
        if (!displayData.playerStats) {
          displayData.playerStats = {};
        }
        
        // Fix for type error: Use safe access to teamId
        displayData.playerStats[teamId as string] = {
          name: teamName,
          players: players.map(player => ({
            Name: player.Name || 'Unknown',
            RS: player.RS || '0',  // Runs scored
            OB: player.OB || '0',  // Overs bowled
            RC: player.RC || '0',  // Runs conceded
            Wkts: player.Wkts || '0', // Wickets
            SR: player.SR || '0',   // Strike rate
            Econ: player.Econ || '0' // Economy
          }))
        };
      }
    });
  }
  
  // If no player stats found in MatchSummary, try to create from Batsmen/Bowlers
  if (!displayData.playerStats || Object.keys(displayData.playerStats).length === 0) {
    console.log("Attempting to create player stats from Batsmen/Bowlers");
    
    if (data.Batsmen && data.Batsmen.Batsman && data.Teams && data.Teams.Team) {
      const batsmen = Array.isArray(data.Batsmen.Batsman) ? 
        data.Batsmen.Batsman : [data.Batsmen.Batsman];
      
      const bowlers = Array.isArray(data.Bowlers?.Bowler) ? 
        data.Bowlers.Bowler : data.Bowlers?.Bowler ? [data.Bowlers.Bowler] : [];
      
      const teams = Array.isArray(data.Teams.Team) ? 
        data.Teams.Team : [data.Teams.Team];
      
      // Initialize player stats for each team
      if (!displayData.playerStats) displayData.playerStats = {};
      
      teams.forEach(team => {
        const teamId = team.Id;
        const teamName = team.Name;
        
        if (!displayData.playerStats![teamId]) {
          displayData.playerStats![teamId] = {
            name: teamName,
            players: []
          };
        }
        
        // Get team's batsmen
        const teamBatsmen = batsmen.filter(player => player.TeamId === teamId);
        
        // Create player records
        teamBatsmen.forEach(batsman => {
          displayData.playerStats![teamId].players.push({
            Name: batsman.Name,
            RS: '0',  // Default values
            OB: '0',
            RC: '0',
            Wkts: '0',
            SR: '0',
            Econ: '0'
          });
        });
      });
    }
  }
  
  return displayData;
};
