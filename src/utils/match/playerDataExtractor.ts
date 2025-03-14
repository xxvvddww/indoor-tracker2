
import { DisplayableMatchInfo } from '../../components/match/types';
import { Ball, BowlerBatsman, MatchDetails, Team } from '../../types/cricket';

// Extract player statistics from match data
export const extractPlayerStats = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  if (!matchData.Teams?.Team) return;
  
  const teams = Array.isArray(matchData.Teams.Team) ? 
    matchData.Teams.Team : [matchData.Teams.Team];
    
  displayInfo.playerStats = displayInfo.playerStats || {};
  
  console.log("Extracting player statistics");
  
  // First check if we have MatchSummary data
  if (matchData.MatchSummary?.team) {
    extractFromMatchSummary(matchData, teams, displayInfo);
  } 
  // If no MatchSummary, try using Batsmen/Bowlers
  else if (matchData.Batsmen?.Batsman || matchData.Bowlers?.Bowler) {
    extractFromBatsmenBowlers(matchData, teams, displayInfo);
  }
  
  // If still no player stats, add empty player lists to each team
  if (Object.keys(displayInfo.playerStats).length === 0) {
    teams.forEach(team => {
      displayInfo.playerStats![team.Id] = {
        name: team.Name,
        players: []
      };
    });
  }
};

// Extract player stats from MatchSummary data
const extractFromMatchSummary = (
  matchData: MatchDetails,
  teams: Team[],
  displayInfo: DisplayableMatchInfo
): void => {
  console.log("Using MatchSummary data for player stats");
  
  if (!matchData.MatchSummary?.team) return;
  
  const summaryTeams = Array.isArray(matchData.MatchSummary.team) ? 
    matchData.MatchSummary.team : matchData.MatchSummary.team ? [matchData.MatchSummary.team] : [];
    
  summaryTeams.forEach(team => {
    if (!team || !team.name) return;
    
    // Find team ID
    const matchingTeam = teams.find(t => t.Name === team.name);
    if (!matchingTeam) return;
    
    const teamId = matchingTeam.Id;
    const players = Array.isArray(team.player) ? team.player : team.player ? [team.player] : [];
    
    if (players.length > 0) {
      displayInfo.playerStats![teamId] = {
        name: team.name,
        players: players.map(player => ({
          Name: player.Name || 'Unknown',
          RS: player.RS || '0',
          OB: player.OB || '0',
          RC: player.RC || '0',
          Wkts: player.Wkts || '0',
          SR: player.SR || '0',
          Econ: player.Econ || '0'
        }))
      };
    }
  });
};

// Create player stats from Batsmen and Bowlers data
const extractFromBatsmenBowlers = (
  matchData: MatchDetails,
  teams: Team[],
  displayInfo: DisplayableMatchInfo
): void => {
  console.log("Using Batsmen/Bowlers data for player stats");
  
  const batsmen = matchData.Batsmen?.Batsman ?
    (Array.isArray(matchData.Batsmen.Batsman) ? matchData.Batsmen.Batsman : [matchData.Batsmen.Batsman]) : [];
  
  const bowlers = matchData.Bowlers?.Bowler ?
    (Array.isArray(matchData.Bowlers.Bowler) ? matchData.Bowlers.Bowler : [matchData.Bowlers.Bowler]) : [];
  
  // Create player stats for each team
  teams.forEach(team => {
    const teamId = team.Id;
    const teamName = team.Name;
    
    displayInfo.playerStats![teamId] = {
      name: teamName,
      players: []
    };
    
    // Add players from both bowlers and batsmen lists
    const teamPlayers = new Set();
    
    [...batsmen, ...bowlers].forEach(player => {
      if (player.TeamId === teamId && !teamPlayers.has(player.Id)) {
        teamPlayers.add(player.Id);
        displayInfo.playerStats![teamId].players.push({
          Name: player.Name || 'Unknown',
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
  
  // Calculate stats from Balls data if available
  if (matchData.Balls?.Ball) {
    const balls = Array.isArray(matchData.Balls.Ball) ? matchData.Balls.Ball : [matchData.Balls.Ball];
    calculateStatsFromBalls(balls, batsmen, bowlers, displayInfo);
  }
};

// Calculate player stats from ball-by-ball data
const calculateStatsFromBalls = (
  balls: Ball[],
  batsmen: BowlerBatsman[],
  bowlers: BowlerBatsman[],
  displayInfo: DisplayableMatchInfo
): void => {
  // Count balls, runs, and wickets for each bowler
  const bowlerBalls: {[bowlerId: string]: number} = {};
  const bowlerRuns: {[bowlerId: string]: number} = {};
  const bowlerWickets: {[bowlerId: string]: number} = {};
  
  // Count runs and balls for each batsman
  const batsmanRuns: {[batsmanId: string]: number} = {};
  const batsmanBalls: {[batsmanId: string]: number} = {};
  
  // Process each ball to gather statistics
  balls.forEach(ball => {
    // Process bowler stats
    const bowlerId = ball.BowlerId;
    if (bowlerId) {
      if (!bowlerBalls[bowlerId]) bowlerBalls[bowlerId] = 0;
      bowlerBalls[bowlerId]++;
      
      if (!bowlerRuns[bowlerId]) bowlerRuns[bowlerId] = 0;
      bowlerRuns[bowlerId] += parseInt(ball.Score || '0');
      
      if (!bowlerWickets[bowlerId]) bowlerWickets[bowlerId] = 0;
      if (ball.IsWicket === 'True') bowlerWickets[bowlerId]++;
    }
    
    // Process batsman stats
    const batsmanId = ball.BatsmanId;
    if (batsmanId) {
      if (!batsmanRuns[batsmanId]) batsmanRuns[batsmanId] = 0;
      batsmanRuns[batsmanId] += parseInt(ball.Score || '0');
      
      if (!batsmanBalls[batsmanId]) batsmanBalls[batsmanId] = 0;
      batsmanBalls[batsmanId]++;
    }
  });
  
  // Update player stats with calculated values
  Object.keys(displayInfo.playerStats!).forEach(teamId => {
    displayInfo.playerStats![teamId].players.forEach(player => {
      // Update bowler stats
      const bowler = bowlers.find(b => b.Name === player.Name && b.TeamId === teamId);
      if (bowler && bowler.Id) {
        const bowlerId = bowler.Id;
        const ballsBowled = bowlerBalls[bowlerId] || 0;
        const overs = Math.floor(ballsBowled / 6); // Assuming 6 balls per over
        
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
};
