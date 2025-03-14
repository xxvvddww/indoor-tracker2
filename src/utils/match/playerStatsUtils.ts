
import { DisplayableMatchInfo } from "../../components/match/types";
import { Ball, BowlerBatsman, MatchDetails, Team } from "../../types/cricket";

// Extract player statistics from match data
export const extractPlayerStats = (data: MatchDetails, displayData: DisplayableMatchInfo): void => {
  displayData.playerStats = {};
  
  // First try to get stats from MatchSummary (most reliable source)
  const statsFromSummary = extractPlayerStatsFromMatchSummary(data, displayData);
  
  // If no stats found in MatchSummary, try to create from Batsmen/Bowlers
  if (!statsFromSummary) {
    extractPlayerStatsFromBatsmenBowlers(data, displayData);
  }
};

// Extract player stats from MatchSummary data
const extractPlayerStatsFromMatchSummary = (
  data: MatchDetails, 
  displayData: DisplayableMatchInfo
): boolean => {
  if (!data.MatchSummary || !data.MatchSummary.team) return false;
  
  // Get teams data if available
  const teams = data.Teams?.Team ? 
    (Array.isArray(data.Teams.Team) ? data.Teams.Team : [data.Teams.Team]) : [];
  
  // Make sure we're dealing with an array of teams
  const summaryTeams = Array.isArray(data.MatchSummary.team) ? 
    data.MatchSummary.team : [data.MatchSummary.team];
  
  let statsFound = false;
  
  summaryTeams.forEach(team => {
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
    } else if (teams.length > 0) {
      // Try to find matching team in raw data
      const matchingTeam = teams.find(t => t.Name === teamName);
      if (matchingTeam) {
        teamId = matchingTeam.Id;
      }
    }
    
    if (teamId && teamName) {
      // Handle players
      const players = Array.isArray(team.player) ? team.player : team.player ? [team.player] : [];
      
      if (players.length > 0) {
        statsFound = true;
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
    }
  });
  
  return statsFound;
};

// Create player stats from Batsmen and Bowlers data
const extractPlayerStatsFromBatsmenBowlers = (
  data: MatchDetails, 
  displayData: DisplayableMatchInfo
): void => {
  if (!data.Batsmen?.Batsman && !data.Bowlers?.Bowler) return;
  if (!data.Teams?.Team) return;
  
  console.log("Creating player stats from Batsmen/Bowlers");
  
  const batsmen = data.Batsmen?.Batsman ?
    (Array.isArray(data.Batsmen.Batsman) ? data.Batsmen.Batsman : [data.Batsmen.Batsman]) : [];
  
  const bowlers = data.Bowlers?.Bowler ?
    (Array.isArray(data.Bowlers.Bowler) ? data.Bowlers.Bowler : [data.Bowlers.Bowler]) : [];
  
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
    addPlayersToStats(batsmen, teamId, displayData, 'batsman');
    
    // Add bowlers from this team
    addPlayersToStats(bowlers, teamId, displayData, 'bowler');
  });
  
  // Now calculate some stats from Balls data
  if (data.Balls?.Ball) {
    calculateStatsFromBalls(data.Balls.Ball, batsmen, bowlers, displayData);
  }
};

// Add players to team stats from batsmen or bowlers list
const addPlayersToStats = (
  players: BowlerBatsman[],
  teamId: string,
  displayData: DisplayableMatchInfo,
  playerType: 'batsman' | 'bowler'
): void => {
  players.filter(player => player.TeamId === teamId).forEach(player => {
    // Check if player is already added
    const existingPlayerIndex = displayData.playerStats![teamId].players.findIndex(
      p => p.Name === player.Name
    );
    
    if (existingPlayerIndex >= 0) {
      // Update existing player for bowler stats
      if (playerType === 'bowler') {
        displayData.playerStats![teamId].players[existingPlayerIndex].OB = '0';
        displayData.playerStats![teamId].players[existingPlayerIndex].RC = '0';
        displayData.playerStats![teamId].players[existingPlayerIndex].Wkts = '0';
      }
    } else {
      // Add new player
      displayData.playerStats![teamId].players.push({
        Name: player.Name,
        RS: '0',
        OB: '0',
        RC: '0',
        Wkts: '0',
        SR: '0',
        Econ: '0'
      });
    }
  });
};

// Calculate detailed player stats from the Balls data
const calculateStatsFromBalls = (
  balls: Ball | Ball[],
  batsmen: BowlerBatsman[],
  bowlers: BowlerBatsman[],
  displayData: DisplayableMatchInfo
): void => {
  const ballsArray = Array.isArray(balls) ? balls : [balls];
  
  // Count balls bowled by each bowler
  const bowlerBalls: {[bowlerId: string]: number} = {};
  const bowlerRuns: {[bowlerId: string]: number} = {};
  const bowlerWickets: {[bowlerId: string]: number} = {};
  
  // Count runs scored by each batsman
  const batsmanRuns: {[batsmanId: string]: number} = {};
  const batsmanBalls: {[batsmanId: string]: number} = {};
  
  ballsArray.forEach(ball => {
    processBowlerStats(ball, bowlerBalls, bowlerRuns, bowlerWickets);
    processBatsmanStats(ball, batsmanRuns, batsmanBalls);
  });
  
  // Update player stats with calculated values
  Object.keys(displayData.playerStats!).forEach(teamId => {
    updatePlayerStatsWithCalculatedValues(
      displayData, teamId, bowlers, bowlerBalls, bowlerRuns, bowlerWickets, 
      batsmen, batsmanRuns, batsmanBalls
    );
  });
};

// Process bowler statistics from a ball
const processBowlerStats = (
  ball: Ball,
  bowlerBalls: {[bowlerId: string]: number},
  bowlerRuns: {[bowlerId: string]: number},
  bowlerWickets: {[bowlerId: string]: number}
): void => {
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
};

// Process batsman statistics from a ball
const processBatsmanStats = (
  ball: Ball,
  batsmanRuns: {[batsmanId: string]: number},
  batsmanBalls: {[batsmanId: string]: number}
): void => {
  const batsmanId = ball.BatsmanId;
  const batsmanTeamId = ball.BatsmanTeamId;
  
  if (batsmanId && batsmanTeamId) {
    if (!batsmanRuns[batsmanId]) batsmanRuns[batsmanId] = 0;
    batsmanRuns[batsmanId] += parseInt(ball.Score || '0');
    
    if (!batsmanBalls[batsmanId]) batsmanBalls[batsmanId] = 0;
    batsmanBalls[batsmanId]++;
  }
};

// Update player stats with calculated values
const updatePlayerStatsWithCalculatedValues = (
  displayData: DisplayableMatchInfo,
  teamId: string,
  bowlers: BowlerBatsman[],
  bowlerBalls: {[bowlerId: string]: number},
  bowlerRuns: {[bowlerId: string]: number},
  bowlerWickets: {[bowlerId: string]: number},
  batsmen: BowlerBatsman[],
  batsmanRuns: {[batsmanId: string]: number},
  batsmanBalls: {[batsmanId: string]: number}
): void => {
  displayData.playerStats![teamId].players.forEach(player => {
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
};
