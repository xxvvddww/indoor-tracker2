
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
  
  console.log(`Found ${batsmen.length} batsmen and ${bowlers.length} bowlers`);
  
  // Create player stats for each team
  teams.forEach(team => {
    const teamId = team.Id;
    const teamName = team.Name;
    
    // Initialize team if not already done
    if (!displayInfo.playerStats![teamId]) {
      displayInfo.playerStats![teamId] = {
        name: teamName,
        players: []
      };
    }
    
    // Add players from both bowlers and batsmen lists
    const teamPlayers = new Set();
    
    // Process batsmen first
    batsmen.forEach(player => {
      if (player.TeamId === teamId && !teamPlayers.has(player.Id)) {
        teamPlayers.add(player.Id);
        console.log(`Adding batsman ${player.Name} to team ${teamName}`);
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
    
    // Then process bowlers
    bowlers.forEach(player => {
      if (player.TeamId === teamId && !teamPlayers.has(player.Id)) {
        teamPlayers.add(player.Id);
        console.log(`Adding bowler ${player.Name} to team ${teamName}`);
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
    
    console.log(`Team ${teamName} now has ${displayInfo.playerStats![teamId].players.length} players`);
  });
  
  // Calculate stats from Balls data if available
  if (matchData.Balls?.Ball) {
    const balls = Array.isArray(matchData.Balls.Ball) ? matchData.Balls.Ball : [matchData.Balls.Ball];
    console.log(`Calculating detailed stats from ${balls.length} balls`);
    calculateStatsFromBalls(balls, batsmen, bowlers, displayInfo);
  }
};
