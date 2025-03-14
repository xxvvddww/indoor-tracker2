
import { DisplayableMatchInfo } from "../../../components/match/types";
import { MatchDetails, Team, Ball } from "../../../types/cricket";
import { calculateStatsFromBalls } from './ballStatsCalculator';

/**
 * Extract player statistics from ball-by-ball data as a last resort
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
  
  // Create players from ball data
  teams.forEach(team => {
    const teamId = team.Id;
    const teamName = team.Name;
    
    // Get balls related to this team (either as batting or bowling team)
    const relevantBalls = balls.filter(ball => 
      ball.BowlerTeamId === teamId || ball.BatsmanTeamId === teamId
    );
    
    if (relevantBalls.length > 0) {
      console.log(`Team ${teamName} has ${relevantBalls.length} relevant balls`);
      
      // Get unique batsmen and bowlers
      const batsmenMap = new Map();
      const bowlerMap = new Map();
      
      relevantBalls.forEach(ball => {
        // Add batsmen from this team
        if (ball.BatsmanTeamId === teamId && ball.BatsmanId && ball.BatsmanName) {
          batsmenMap.set(ball.BatsmanId, ball.BatsmanName);
        }
        
        // Add bowlers from this team
        if (ball.BowlerTeamId === teamId && ball.BowlerId && ball.BowlerName) {
          bowlerMap.set(ball.BowlerId, ball.BowlerName);
        }
      });
      
      console.log(`Found ${batsmenMap.size} batsmen and ${bowlerMap.size} bowlers for team ${teamName}`);
      
      // Add players to team if we found any
      if (batsmenMap.size > 0 || bowlerMap.size > 0) {
        // Clear existing players if any
        displayInfo.playerStats![teamId].players = [];
        
        // Add batsmen
        batsmenMap.forEach((name, id) => {
          displayInfo.playerStats![teamId].players.push({
            Name: name || 'Unknown Batsman',
            RS: '0',
            OB: '0',
            RC: '0',
            Wkts: '0',
            SR: '0',
            Econ: '0'
          });
        });
        
        // Add bowlers (avoiding duplicates)
        bowlerMap.forEach((name, id) => {
          if (!displayInfo.playerStats![teamId].players.some(p => p.Name === name)) {
            displayInfo.playerStats![teamId].players.push({
              Name: name || 'Unknown Bowler',
              RS: '0',
              OB: '0',
              RC: '0',
              Wkts: '0',
              SR: '0',
              Econ: '0'
            });
          }
        });
      }
    }
  });
  
  // After extracting players, calculate their stats
  if (balls.length > 0) {
    console.log("Calculating player stats from ball data");
    calculateBallStatistics(balls, displayInfo);
  }
};

/**
 * Calculate statistics for players based on ball data
 */
const calculateBallStatistics = (
  balls: Ball[],
  displayInfo: DisplayableMatchInfo
): void => {
  // Process each ball to update player stats
  balls.forEach(ball => {
    const batsmanTeamId = ball.BatsmanTeamId;
    const bowlerTeamId = ball.BowlerTeamId;
    const runs = parseInt(ball.Score || '0');
    const isWicket = ball.IsWicket === 'True';
    
    // Update batsman stats
    if (batsmanTeamId && ball.BatsmanName) {
      const player = displayInfo.playerStats![batsmanTeamId]?.players.find(
        p => p.Name === ball.BatsmanName
      );
      
      if (player) {
        player.RS = (parseInt(player.RS || '0') + runs).toString();
      }
    }
    
    // Update bowler stats
    if (bowlerTeamId && ball.BowlerName) {
      const player = displayInfo.playerStats![bowlerTeamId]?.players.find(
        p => p.Name === ball.BowlerName
      );
      
      if (player) {
        player.RC = (parseInt(player.RC || '0') + runs).toString();
        if (isWicket) {
          player.Wkts = (parseInt(player.Wkts || '0') + 1).toString();
        }
      }
    }
  });
}
