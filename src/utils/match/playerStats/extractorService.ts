
import { DisplayableMatchInfo } from "../../../components/match/types";
import { MatchDetails, Team } from "../../../types/cricket";
import { extractFromMatchSummary } from './summaryExtractor';
import { extractFromBatsmenBowlers } from './bowlerBatsmanExtractor';
import { ensureTeamStats } from './teamStatsInitializer';

/**
 * Extracts player statistics from match data using the best available data source
 */
export const extractPlayerStatsFromMatch = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  console.log("Starting player stats extraction process");
  
  if (!matchData.Teams?.Team) {
    console.log("No teams data available, cannot extract player stats");
    return;
  }
  
  const teams = Array.isArray(matchData.Teams.Team) ? 
    matchData.Teams.Team : [matchData.Teams.Team];
    
  console.log(`Found ${teams.length} teams for player stats extraction`);
  
  // Initialize player stats object if it doesn't exist
  displayInfo.playerStats = displayInfo.playerStats || {};
  
  // First ensure we have team entries even if no player data is found
  ensureTeamStats(teams, displayInfo);
  console.log("Team stats containers initialized");
  
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
  
  // Last resort: Try extracting from Balls data
  if (!statsExtracted && matchData.Balls?.Ball) {
    console.log("Trying to extract player stats directly from Balls data");
    
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
          
          statsExtracted = true;
        }
      }
    });
    
    // After extracting players, calculate their stats
    if (statsExtracted && balls.length > 0) {
      console.log("Calculating player stats from ball data");
      
      // Process each ball to update player stats
      balls.forEach(ball => {
        const batsmanTeamId = ball.BatsmanTeamId;
        const bowlerTeamId = ball.BowlerTeamId;
        const runs = parseInt(ball.Score || '0');
        const isWicket = ball.IsWicket === 'True';
        
        // Update batsman stats
        if (batsmanTeamId && ball.BatsmanName) {
          const player = displayInfo.playerStats![batsmanTeamId].players.find(
            p => p.Name === ball.BatsmanName
          );
          
          if (player) {
            player.RS = (parseInt(player.RS || '0') + runs).toString();
          }
        }
        
        // Update bowler stats
        if (bowlerTeamId && ball.BowlerName) {
          const player = displayInfo.playerStats![bowlerTeamId].players.find(
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
  }
  
  // Log the final result
  Object.keys(displayInfo.playerStats).forEach(teamId => {
    const team = displayInfo.playerStats![teamId];
    console.log(`Team ${teamId} (${team.name}) final player count: ${team.players.length}`);
    
    if (team.players.length > 0) {
      console.log(`First player: ${team.players[0].Name}, runs: ${team.players[0].RS}, wickets: ${team.players[0].Wkts}`);
    }
  });
};
