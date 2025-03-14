
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
  
  // Look for venue in PlayingAreaName (which exists in the raw data)
  if (data.Configuration && (data.Configuration as any).PlayingAreaName) {
    displayData.venue = (data.Configuration as any).PlayingAreaName;
  }
  
  // Extract match date from Configuration if available
  if (data.Configuration) {
    try {
      // In MatchDetails type, Team1InningsStartTime doesn't exist, but we can check if it exists at runtime
      const startTimeStr = (data.Configuration as any).Team1InningsStartTime;
      if (startTimeStr && typeof startTimeStr === 'string') {
        const dateString = startTimeStr.split(' ')[0];
        displayData.date = dateString;
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  }
  
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
    } else if (teamsData[0]?.Points && teamsData[1]?.Points) {
      // Alternative way to determine winner based on points
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
    }
  }
  
  // Initialize player stats
  displayData.playerStats = {};
  
  // Extract player stats from MatchSummary - THIS IS THE MAIN DATA SOURCE
  if (data.MatchSummary && data.MatchSummary.team) {
    // Make sure we're dealing with an array of teams
    const teams = Array.isArray(data.MatchSummary.team) ? 
      data.MatchSummary.team : [data.MatchSummary.team];
    
    teams.forEach(team => {
      if (!team) return;
      
      // Get team name
      const teamName = typeof team === 'object' && 'name' in team ? team.name : '';
      
      // Find team ID from Teams data
      let teamId = '';
      if (displayData.teams) {
        const matchingTeam = displayData.teams.find(t => t.name === teamName);
        if (matchingTeam) {
          teamId = matchingTeam.id;
        }
      }
      
      if (teamId && teamName) {
        // Handle players
        const players = Array.isArray(team.player) ? team.player : team.player ? [team.player] : [];
        
        displayData.playerStats[teamId] = {
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
  if (Object.keys(displayData.playerStats).length === 0) {
    console.log("Attempting to create player stats from Batsmen/Bowlers");
    
    if (data.Batsmen && data.Batsmen.Batsman && data.Teams && data.Teams.Team) {
      const batsmen = Array.isArray(data.Batsmen.Batsman) ? 
        data.Batsmen.Batsman : [data.Batsmen.Batsman];
      
      const bowlers = Array.isArray(data.Bowlers?.Bowler) ? 
        data.Bowlers.Bowler : data.Bowlers?.Bowler ? [data.Bowlers.Bowler] : [];
      
      // Get team data
      const teams = Array.isArray(data.Teams.Team) ? 
        data.Teams.Team : [data.Teams.Team];
      
      // Create player stats for each team
      teams.forEach(team => {
        const teamId = team.Id;
        const teamName = team.Name;
        
        displayData.playerStats![teamId] = {
          name: teamName,
          players: []
        };
        
        // Add batsmen from this team
        batsmen.filter(player => player.TeamId === teamId).forEach(batsman => {
          // Check if player is already added
          const existingPlayerIndex = displayData.playerStats![teamId].players.findIndex(
            p => p.Name === batsman.Name
          );
          
          if (existingPlayerIndex >= 0) {
            // Update existing player
            displayData.playerStats![teamId].players[existingPlayerIndex].RS = '0';
          } else {
            // Add new player
            displayData.playerStats![teamId].players.push({
              Name: batsman.Name,
              RS: '0',
              OB: '0',
              RC: '0',
              Wkts: '0',
              SR: '0',
              Econ: '0'
            });
          }
        });
        
        // Add bowlers from this team
        bowlers.filter(player => player.TeamId === teamId).forEach(bowler => {
          // Check if player is already added
          const existingPlayerIndex = displayData.playerStats![teamId].players.findIndex(
            p => p.Name === bowler.Name
          );
          
          if (existingPlayerIndex >= 0) {
            // Update existing player
            displayData.playerStats![teamId].players[existingPlayerIndex].OB = '0';
            displayData.playerStats![teamId].players[existingPlayerIndex].RC = '0';
            displayData.playerStats![teamId].players[existingPlayerIndex].Wkts = '0';
          } else {
            // Add new player
            displayData.playerStats![teamId].players.push({
              Name: bowler.Name,
              RS: '0',
              OB: '0',
              RC: '0',
              Wkts: '0',
              SR: '0',
              Econ: '0'
            });
          }
        });
      });
      
      // Now calculate some stats from Balls data
      if (data.Balls && data.Balls.Ball) {
        const balls = Array.isArray(data.Balls.Ball) ? 
          data.Balls.Ball : [data.Balls.Ball];
        
        // Count balls bowled by each bowler
        const bowlerBalls: {[bowlerId: string]: number} = {};
        const bowlerRuns: {[bowlerId: string]: number} = {};
        const bowlerWickets: {[bowlerId: string]: number} = {};
        
        // Count runs scored by each batsman
        const batsmanRuns: {[batsmanId: string]: number} = {};
        const batsmanBalls: {[batsmanId: string]: number} = {};
        
        balls.forEach(ball => {
          // Process bowler stats
          const bowlerId = ball.BowlerId;
          const bowlerTeamId = ball.BowlerTeamId;
          
          if (bowlerId && bowlerTeamId) {
            if (!bowlerBalls[bowlerId]) bowlerBalls[bowlerId] = 0;
            bowlerBalls[bowlerId]++;
            
            if (!bowlerRuns[bowlerId]) bowlerRuns[bowlerId] = 0;
            bowlerRuns[bowlerId] += parseInt(ball.Score || '0');
            
            if (!bowlerWickets[bowlerId]) bowlerWickets[bowlerId] = 0;
            if (ball.IsWicket === 'True') bowlerWickets[bowlerId]++;
          }
          
          // Process batsman stats
          const batsmanId = ball.BatsmanId;
          const batsmanTeamId = ball.BatsmanTeamId;
          
          if (batsmanId && batsmanTeamId) {
            if (!batsmanRuns[batsmanId]) batsmanRuns[batsmanId] = 0;
            batsmanRuns[batsmanId] += parseInt(ball.Score || '0');
            
            if (!batsmanBalls[batsmanId]) batsmanBalls[batsmanId] = 0;
            batsmanBalls[batsmanId]++;
          }
        });
        
        // Update player stats with calculated values
        teams.forEach(team => {
          const teamId = team.Id;
          
          displayData.playerStats![teamId].players.forEach(player => {
            // Find player ID
            const bowler = bowlers.find(b => b.Name === player.Name && b.TeamId === teamId);
            if (bowler && bowler.Id) {
              const bowlerId = bowler.Id;
              const ballsBowled = bowlerBalls[bowlerId] || 0;
              const overs = Math.floor(ballsBowled / 5); // Assuming 5 balls per over
              
              player.OB = overs.toString();
              player.RC = (bowlerRuns[bowlerId] || 0).toString();
              player.Wkts = (bowlerWickets[bowlerId] || 0).toString();
              
              // Calculate economy
              if (overs > 0) {
                const economy = (bowlerRuns[bowlerId] || 0) / overs;
                player.Econ = economy.toFixed(1);
              }
            }
            
            // Update batsman stats
            const batsman = batsmen.find(b => b.Name === player.Name && b.TeamId === teamId);
            if (batsman && batsman.Id) {
              const batsmanId = batsman.Id;
              
              player.RS = (batsmanRuns[batsmanId] || 0).toString();
              
              // Calculate strike rate
              const ballsFaced = batsmanBalls[batsmanId] || 0;
              if (ballsFaced > 0) {
                const strikeRate = ((batsmanRuns[batsmanId] || 0) / ballsFaced) * 100;
                player.SR = strikeRate.toFixed(1);
              }
            }
          });
        });
      }
    }
  }
  
  return displayData;
};
