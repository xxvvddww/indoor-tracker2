import { DisplayableMatchInfo } from "../../../components/match/types";
import { MatchDetails, Team, Ball } from "../../../types/cricket";
import { calculateStatsFromBalls } from './ballStatsCalculator';

/**
 * Extract player statistics from ball-by-ball data
 */
export const extractFromBallData = (
  matchData: MatchDetails,
  teams: Team[],
  displayInfo: DisplayableMatchInfo
): void => {
  if (!matchData.Balls?.Ball) {
    console.log("No Ball data available for extraction");
    return;
  }
  
  const balls = Array.isArray(matchData.Balls.Ball) ? 
    matchData.Balls.Ball : [matchData.Balls.Ball];
    
  console.log(`Found ${balls.length} balls for player extraction`);
  
  // Create unique player lists for each team
  const teamPlayers: Record<string, Map<string, string>> = {};
  const ballsWithNames: Ball[] = [];
  
  // Initialize team player maps
  teams.forEach(team => {
    teamPlayers[team.Id] = new Map();
  });
  
  // First, scan through all balls to identify players by ID
  balls.forEach(ball => {
    // Sometimes the ball data includes player names directly
    if (ball.BatsmanId && ball.BatsmanTeamId && teams.some(t => t.Id === ball.BatsmanTeamId)) {
      const batsmanName = extractPlayerNameFromBall(ball, 'batsman');
      if (batsmanName) {
        teamPlayers[ball.BatsmanTeamId].set(ball.BatsmanId, batsmanName);
        ball.BatsmanName = batsmanName; // Add to the ball for later use
      }
    }
    
    if (ball.BowlerId && ball.BowlerTeamId && teams.some(t => t.Id === ball.BowlerTeamId)) {
      const bowlerName = extractPlayerNameFromBall(ball, 'bowler');
      if (bowlerName) {
        teamPlayers[ball.BowlerTeamId].set(ball.BowlerId, bowlerName);
        ball.BowlerName = bowlerName; // Add to the ball for later use
      }
    }
    
    // Keep track of balls that have names
    if (ball.BatsmanName || ball.BowlerName) {
      ballsWithNames.push(ball);
    }
  });
  
  // Now create player entries in displayInfo
  teams.forEach(team => {
    const teamId = team.Id;
    const players = teamPlayers[teamId];
    
    // If we found any players, add them to the team
    if (players.size > 0) {
      console.log(`Found ${players.size} players for team ${team.Name}`);
      
      // Reset the players array for this team
      displayInfo.playerStats![teamId].players = [];
      
      // Add each player with default stats
      players.forEach((name, id) => {
        displayInfo.playerStats![teamId].players.push({
          Name: name,
          RS: '0',
          OB: '0',
          RC: '0',
          Wkts: '0',
          SR: '0',
          Econ: '0',
          PlayerId: id
        });
      });
    }
  });
  
  // Calculate statistics based on ball data if we have player names
  if (ballsWithNames.length > 0) {
    calculatePlayerStats(ballsWithNames, displayInfo);
  }
};

// Extract player name from ball data
const extractPlayerNameFromBall = (ball: Ball, type: 'batsman' | 'bowler'): string | null => {
  if (type === 'batsman') {
    return ball.BatsmanName || null;
  } else {
    return ball.BowlerName || null;
  }
};

// Calculate player statistics from ball data
const calculatePlayerStats = (balls: Ball[], displayInfo: DisplayableMatchInfo): void => {
  console.log(`Calculating player stats from ${balls.length} balls with player names`);
  
  // Track stats by player ID
  const playerStats: Record<string, {
    runs: number;
    balls: number;
    overs: number;
    runsConceded: number;
    wickets: number;
    teamId: string;
  }> = {};
  
  // Process each ball
  balls.forEach(ball => {
    const batsmanId = ball.BatsmanId;
    const bowlerId = ball.BowlerId;
    const runs = parseInt(ball.Score || '0', 10);
    const isWicket = ball.IsWicket === 'True';
    
    // Update batsman stats
    if (batsmanId && ball.BatsmanTeamId) {
      if (!playerStats[batsmanId]) {
        playerStats[batsmanId] = {
          runs: 0,
          balls: 0,
          overs: 0,
          runsConceded: 0,
          wickets: 0,
          teamId: ball.BatsmanTeamId
        };
      }
      
      playerStats[batsmanId].runs += runs;
      playerStats[batsmanId].balls += 1;
    }
    
    // Update bowler stats
    if (bowlerId && ball.BowlerTeamId) {
      if (!playerStats[bowlerId]) {
        playerStats[bowlerId] = {
          runs: 0,
          balls: 0,
          overs: 0,
          runsConceded: 0,
          wickets: 0,
          teamId: ball.BowlerTeamId
        };
      }
      
      playerStats[bowlerId].runsConceded += runs;
      playerStats[bowlerId].balls += 1;
      
      // Assuming 6 balls per over
      playerStats[bowlerId].overs = Math.floor(playerStats[bowlerId].balls / 6);
      
      if (isWicket) {
        playerStats[bowlerId].wickets += 1;
      }
    }
  });
  
  // Update player statistics in displayInfo
  Object.keys(playerStats).forEach(playerId => {
    const stats = playerStats[playerId];
    const teamId = stats.teamId;
    
    if (displayInfo.playerStats![teamId]) {
      const player = displayInfo.playerStats![teamId].players.find(p => p.PlayerId === playerId);
      
      if (player) {
        player.RS = stats.runs.toString();
        player.OB = stats.overs.toString();
        player.RC = stats.runsConceded.toString();
        player.Wkts = stats.wickets.toString();
        
        // Calculate strike rate (runs / balls * 100)
        if (stats.balls > 0) {
          player.SR = ((stats.runs / stats.balls) * 100).toFixed(1);
        }
        
        // Calculate economy (runs conceded / overs)
        if (stats.overs > 0) {
          player.Econ = (stats.runsConceded / stats.overs).toFixed(1);
        }
      }
    }
  });
  
  console.log("Player stats calculation from ball data complete");
};

