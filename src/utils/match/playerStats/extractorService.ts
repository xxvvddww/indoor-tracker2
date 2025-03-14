
import { DisplayableMatchInfo } from "../../../components/match/types";
import { MatchDetails, Team } from "../../../types/cricket";
import { extractFromMatchSummary } from './summaryExtractor';
import { extractFromBatsmenBowlers } from './bowlerBatsmanExtractor';
import { extractFromBallData } from './ballDataExtractor';
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
    extractFromBallData(matchData, teams, displayInfo);
    statsExtracted = true;
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
