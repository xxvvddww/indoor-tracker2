
import { DisplayableMatchInfo } from '../../../components/match/types';
import { Ball, BowlerBatsman, MatchDetails, Team } from '../../../types/cricket';
import { calculateStatsFromBalls } from './ballStatsCalculator';

// Create player stats from Batsmen and Bowlers data
export const extractFromBatsmenBowlers = (
  matchData: MatchDetails,
  teams: Team[],
  displayInfo: DisplayableMatchInfo
): void => {
  console.log("Using Batsmen/Bowlers data for player stats extraction");
  
  // Ensure we handle both array and single object cases for batsmen
  const batsmen = matchData.Batsmen?.Batsman ? 
    (Array.isArray(matchData.Batsmen.Batsman) ? matchData.Batsmen.Batsman : [matchData.Batsmen.Batsman]) : [];
  
  // Ensure we handle both array and single object cases for bowlers
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
    } else {
      // Clear existing players to avoid duplication
      displayInfo.playerStats![teamId].players = [];
    }
    
    // Add players from both bowlers and batsmen lists
    const teamPlayerIds = new Set();
    
    // Process batsmen first
    batsmen.forEach(player => {
      if (player.TeamId === teamId && !teamPlayerIds.has(player.Id)) {
        teamPlayerIds.add(player.Id);
        console.log(`Adding batsman ${player.Name} to team ${teamName}`);
        displayInfo.playerStats![teamId].players.push({
          Name: player.Name || 'Unknown',
          RS: player.RunsScored || '0',
          OB: '0',
          RC: '0',
          Wkts: '0',
          SR: player.StrikeRate || '0',
          Econ: '0'
        });
      }
    });
    
    // Then process bowlers
    bowlers.forEach(player => {
      if (player.TeamId === teamId && !teamPlayerIds.has(player.Id)) {
        teamPlayerIds.add(player.Id);
        console.log(`Adding bowler ${player.Name} to team ${teamName}`);
        displayInfo.playerStats![teamId].players.push({
          Name: player.Name || 'Unknown',
          RS: '0',
          OB: player.OversBowled || '0',
          RC: player.RunsConceded || '0',
          Wkts: player.Wickets || '0',
          SR: '0',
          Econ: player.Economy || '0'
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
