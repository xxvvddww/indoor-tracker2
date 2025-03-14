
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
  
  if (!displayInfo.teams || displayInfo.teams.length === 0) {
    console.log("No teams defined in displayInfo, skipping player stats extraction");
    return;
  }
  
  // Use displayInfo teams as the source of truth
  const teams = displayInfo.teams;
  console.log(`Using ${teams.length} teams from displayInfo for player stats extraction`);
  
  // Initialize player stats object if it doesn't exist
  displayInfo.playerStats = displayInfo.playerStats || {};
  
  // First ensure we have team entries even if no player data is found
  ensureTeamStatsFromDisplayTeams(teams, displayInfo);
  console.log("Team stats containers initialized from displayInfo teams");
  
  let statsExtracted = false;
  
  // First check if we have MatchSummary data (highest quality source)
  if (matchData.MatchSummary) {
    console.log("Found MatchSummary data, using it for player stats");
    
    // Convert displayInfo teams to the format expected by the extractors
    const teamFormatForExtractors = teams.map(team => ({
      Id: team.id,
      Name: team.name
    }));
    
    extractFromMatchSummary(matchData, teamFormatForExtractors, displayInfo);
    
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
    
    // Convert displayInfo teams to the format expected by the extractors
    const teamFormatForExtractors = teams.map(team => ({
      Id: team.id,
      Name: team.name
    }));
    
    extractFromBatsmenBowlers(matchData, teamFormatForExtractors, displayInfo);
    
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
    
    // Convert displayInfo teams to the format expected by the extractors
    const teamFormatForExtractors = teams.map(team => ({
      Id: team.id,
      Name: team.name
    }));
    
    extractFromBallData(matchData, teamFormatForExtractors, displayInfo);
    
    // Check again if we got any players
    statsExtracted = Object.keys(displayInfo.playerStats).some(teamId => 
      displayInfo.playerStats![teamId].players && 
      displayInfo.playerStats![teamId].players.length > 0
    );
    
    console.log("Stats extracted from Balls data:", statsExtracted);
  }
  
  // If no data was extracted from any source, add placeholder text
  if (!statsExtracted) {
    console.log("No player stats could be extracted from any data source");
    
    // Add placeholder message for each team
    teams.forEach(team => {
      displayInfo.playerStats![team.id].players = [
        {
          Name: "No player statistics available for this match",
          RS: "-",
          OB: "-",
          RC: "-",
          Wkts: "-",
          SR: "-",
          Econ: "-"
        }
      ];
    });
  }
  
  // Log the final result
  Object.keys(displayInfo.playerStats).forEach(teamId => {
    const team = displayInfo.playerStats![teamId];
    console.log(`Team ${teamId} (${team.name}) final player count: ${team.players.length}`);
    
    if (team.players.length > 0) {
      console.log(`First player: ${team.players[0].Name}`);
    }
  });
};

// Initialize team stats containers from displayInfo teams
const ensureTeamStatsFromDisplayTeams = (teams: {id: string, name: string}[], displayInfo: DisplayableMatchInfo): void => {
  teams.forEach(team => {
    if (!displayInfo.playerStats![team.id]) {
      displayInfo.playerStats![team.id] = {
        name: team.name,
        players: []
      };
    }
  });
};
