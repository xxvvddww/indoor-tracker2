
import { DisplayableMatchInfo } from '../../../components/match/types';
import { Ball, BowlerBatsman, MatchDetails, Team } from '../../../types/cricket';
import { calculateStatsFromBalls } from './ballStatsCalculator';

// Create player stats from Batsmen and Bowlers data
export const extractFromBatsmenBowlers = (
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
