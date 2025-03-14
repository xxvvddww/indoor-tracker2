
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
  
  // Check if the data is contained in a nested property
  if (matchData.Statistics) {
    console.log("Found nested Statistics data, using it instead");
    extractPlayerStatsFromMatch(matchData.Statistics as any, displayInfo);
    
    // Check if we actually got player data
    statsExtracted = Object.keys(displayInfo.playerStats).some(teamId => 
      displayInfo.playerStats![teamId].players && 
      displayInfo.playerStats![teamId].players.length > 0 &&
      !displayInfo.playerStats![teamId].players[0].Name.includes("No player statistics")
    );
    
    if (statsExtracted) {
      console.log("Successfully extracted player stats from nested Statistics");
      return;
    }
  }
  
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
      displayInfo.playerStats![teamId].players.length > 0 &&
      !displayInfo.playerStats![teamId].players[0].Name.includes("No player statistics")
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
      displayInfo.playerStats![teamId].players.length > 0 &&
      !displayInfo.playerStats![teamId].players[0].Name.includes("No player statistics")
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
      displayInfo.playerStats![teamId].players.length > 0 &&
      !displayInfo.playerStats![teamId].players[0].Name.includes("No player statistics")
    );
    
    console.log("Stats extracted from Balls data:", statsExtracted);
  }
  
  // Try additional data sources - check if there are player lists in the data
  if (!statsExtracted && matchData.Players) {
    console.log("Trying to extract player stats from Players list");
    
    try {
      extractPlayersFromPlayersList(matchData, displayInfo);
      
      // Check if we got any players
      statsExtracted = Object.keys(displayInfo.playerStats).some(teamId => 
        displayInfo.playerStats![teamId].players && 
        displayInfo.playerStats![teamId].players.length > 0 &&
        !displayInfo.playerStats![teamId].players[0].Name.includes("No player statistics")
      );
      
      console.log("Stats extracted from Players list:", statsExtracted);
    } catch (error) {
      console.error("Error extracting from Players list:", error);
    }
  }
};

// Extract players from Players list if available
const extractPlayersFromPlayersList = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  if (!matchData.Players || !displayInfo.playerStats) return;
  
  const players = Array.isArray(matchData.Players.Player) 
    ? matchData.Players.Player 
    : [matchData.Players.Player];
  
  console.log(`Found ${players.length} players in Players list`);
  
  displayInfo.teams?.forEach(team => {
    const teamId = team.id;
    
    // Find players for this team
    const teamPlayers = players.filter(p => p.TeamId === teamId);
    
    if (teamPlayers.length > 0) {
      console.log(`Found ${teamPlayers.length} players for team ${team.name}`);
      
      displayInfo.playerStats![teamId].players = teamPlayers.map(player => ({
        Name: player.Name || player.PlayerName || 'Unknown Player',
        RS: player.RunsScored || player.RS || '0',
        OB: player.OversBowled || player.OB || '0',
        RC: player.RunsConceded || player.RC || '0',
        Wkts: player.Wickets || player.Wkts || '0',
        SR: player.StrikeRate || player.SR || '0',
        Econ: player.Economy || player.Econ || '0',
        PlayerId: player.Id || player.PlayerId || ''
      }));
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
