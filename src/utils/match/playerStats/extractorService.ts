
import { DisplayableMatchInfo } from "../../../components/match/types";
import { MatchDetails, Team } from "../../../types/cricket";
import { extractFromMatchSummary } from './summaryExtractor';
import { extractFromBatsmenBowlers } from './bowlerBatsmanExtractor';
import { ensureTeamStats } from './teamStatsInitializer';

/**
 * Extracts player statistics from match data using the best available data source
 */
export const extractPlayerStats = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  if (!matchData.Teams?.Team) {
    console.log("No teams data available, cannot extract player stats");
    return;
  }
  
  const teams = Array.isArray(matchData.Teams.Team) ? 
    matchData.Teams.Team : [matchData.Teams.Team];
    
  displayInfo.playerStats = displayInfo.playerStats || {};
  
  console.log("Extracting player statistics");
  
  let statsExtracted = false;
  
  // First check if we have MatchSummary data (highest quality source)
  if (matchData.MatchSummary) {
    console.log("Found MatchSummary data, using it for player stats");
    extractFromMatchSummary(matchData, teams, displayInfo);
    statsExtracted = Object.keys(displayInfo.playerStats).length > 0;
  } 
  
  // If no MatchSummary or it didn't yield stats, try using Batsmen/Bowlers
  if (!statsExtracted && (matchData.Batsmen?.Batsman || matchData.Bowlers?.Bowler)) {
    console.log("Using Batsmen/Bowlers data for player stats");
    extractFromBatsmenBowlers(matchData, teams, displayInfo);
    statsExtracted = Object.keys(displayInfo.playerStats).length > 0;
  }
  
  // If still no player stats, ensure we at least have empty player lists for each team
  if (!statsExtracted) {
    console.log("No player data sources found, creating empty team records");
    ensureTeamStats(teams, displayInfo);
  }
};
