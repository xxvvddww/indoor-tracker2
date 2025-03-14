
import { DisplayableMatchInfo } from "../../../components/match/types";
import { MatchDetails, Team } from "../../../types/cricket";
import { extractFromMatchSummary } from './summaryExtractor';
import { extractFromBatsmenBowlers } from './bowlerBatsmanExtractor';
import { ensureTeamStats } from './teamStatsInitializer';

/**
 * Extracts player statistics from match data using the best available data source
 */
export const extractPlayerStatsFromMatch = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  if (!matchData.Teams?.Team) {
    console.log("No teams data available, cannot extract player stats");
    return;
  }
  
  const teams = Array.isArray(matchData.Teams.Team) ? 
    matchData.Teams.Team : [matchData.Teams.Team];
    
  displayInfo.playerStats = displayInfo.playerStats || {};
  
  console.log("Extracting player statistics from available data sources");
  
  let statsExtracted = false;
  
  // First check if we have MatchSummary data (highest quality source)
  if (matchData.MatchSummary) {
    console.log("Found MatchSummary data, using it for player stats");
    extractFromMatchSummary(matchData, teams, displayInfo);
    
    // Check if we actually got player data
    statsExtracted = Object.keys(displayInfo.playerStats).some(teamId => 
      displayInfo.playerStats![teamId].players && 
      displayInfo.playerStats![teamId].players.length > 0
    );
    
    console.log("Stats extracted from MatchSummary:", statsExtracted);
  } 
  
  // If no MatchSummary or it didn't yield stats, try using Batsmen/Bowlers
  if (!statsExtracted && (matchData.Batsmen?.Batsman || matchData.Bowlers?.Bowler)) {
    console.log("Using Batsmen/Bowlers data for player stats");
    extractFromBatsmenBowlers(matchData, teams, displayInfo);
    
    // Check if we got player data
    statsExtracted = Object.keys(displayInfo.playerStats).some(teamId => 
      displayInfo.playerStats![teamId].players && 
      displayInfo.playerStats![teamId].players.length > 0
    );
    
    console.log("Stats extracted from Batsmen/Bowlers:", statsExtracted);
  }
  
  // If still no player stats, ensure we at least have empty player lists for each team
  if (!statsExtracted) {
    console.log("No player data sources found or no player data extracted, creating team records");
    ensureTeamStats(teams, displayInfo);
    
    // Try extracting from Balls data as a last resort
    if (matchData.Balls?.Ball) {
      console.log("Trying to extract player stats directly from Balls data");
      
      const balls = Array.isArray(matchData.Balls.Ball) ? 
        matchData.Balls.Ball : [matchData.Balls.Ball];
        
      // Create placeholder players from ball data if none exist
      teams.forEach(team => {
        const teamId = team.Id;
        const relevantBalls = balls.filter(ball => 
          ball.BowlerTeamId === teamId || ball.BatsmanTeamId === teamId
        );
        
        if (relevantBalls.length > 0) {
          // Get unique batsmen and bowlers from balls
          const batsmenIds = new Set(
            relevantBalls
              .filter(ball => ball.BatsmanId && ball.BatsmanName)
              .map(ball => ball.BatsmanId)
          );
          
          const bowlerIds = new Set(
            relevantBalls
              .filter(ball => ball.BowlerId && ball.BowlerName)
              .map(ball => ball.BowlerId)
          );
          
          // If we have players from ball data, add them
          if (batsmenIds.size > 0 || bowlerIds.size > 0) {
            console.log(`Adding players from ball data for team ${teamId}`);
            
            // Add batsmen
            relevantBalls
              .filter(ball => ball.BatsmanId && ball.BatsmanName && batsmenIds.has(ball.BatsmanId))
              .forEach(ball => {
                if (!displayInfo.playerStats![teamId].players.some(p => p.Name === ball.BatsmanName)) {
                  displayInfo.playerStats![teamId].players.push({
                    Name: ball.BatsmanName || 'Unknown Batsman',
                    RS: '0',
                    OB: '0',
                    RC: '0',
                    Wkts: '0',
                    SR: '0',
                    Econ: '0'
                  });
                }
                batsmenIds.delete(ball.BatsmanId);
              });
              
            // Add bowlers
            relevantBalls
              .filter(ball => ball.BowlerId && ball.BowlerName && bowlerIds.has(ball.BowlerId))
              .forEach(ball => {
                if (!displayInfo.playerStats![teamId].players.some(p => p.Name === ball.BowlerName)) {
                  displayInfo.playerStats![teamId].players.push({
                    Name: ball.BowlerName || 'Unknown Bowler',
                    RS: '0',
                    OB: '0',
                    RC: '0',
                    Wkts: '0',
                    SR: '0',
                    Econ: '0'
                  });
                }
                bowlerIds.delete(ball.BowlerId);
              });
          }
        }
      });
    }
  }
  
  // Log the final result
  Object.keys(displayInfo.playerStats).forEach(teamId => {
    console.log(`Team ${teamId} final player count:`, 
      displayInfo.playerStats![teamId].players.length);
  });
};
