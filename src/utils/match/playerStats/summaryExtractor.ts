
import { DisplayableMatchInfo } from '../../../components/match/types';
import { MatchDetails, PlayerMatchSummary, Team, TeamMatchSummary } from '../../../types/cricket';

// Extract player stats from MatchSummary data
export const extractFromMatchSummary = (
  matchData: MatchDetails,
  teams: Team[],
  displayInfo: DisplayableMatchInfo
): void => {
  console.log("Using MatchSummary data for player stats");
  
  if (!matchData.MatchSummary) {
    console.log("No MatchSummary data available");
    return;
  }
  
  // Check for Man of the Match
  if (matchData.MatchSummary.manOfMatch && typeof matchData.MatchSummary.manOfMatch === 'string') {
    console.log("Found Man of the Match:", matchData.MatchSummary.manOfMatch);
    displayInfo.manOfMatch = matchData.MatchSummary.manOfMatch;
  }
  
  // Handle teams - access directly from the root level of MatchSummary
  if (!matchData.MatchSummary.team) {
    console.log("No team data in MatchSummary");
    return;
  }
  
  // Ensure we're dealing with an array of team summary data
  const summaryTeams = Array.isArray(matchData.MatchSummary.team) ? 
    matchData.MatchSummary.team : [matchData.MatchSummary.team];
  
  console.log(`Found ${summaryTeams.length} teams in MatchSummary`);
    
  summaryTeams.forEach(team => {
    if (!team || !team.name) {
      console.log("Invalid team data in MatchSummary");
      return;
    }
    
    console.log(`Processing team: ${team.name}`);
    
    // Find team ID by matching name
    const matchingTeam = teams.find(t => t.Name === team.name);
    if (!matchingTeam) {
      console.log(`No matching team found for: ${team.name}`);
      return;
    }
    
    const teamId = matchingTeam.Id;
    console.log(`Found matching teamId: ${teamId}`);
    
    // Process player data, ensuring we handle both array and single player cases
    const players = Array.isArray(team.player) ? team.player : team.player ? [team.player] : [];
    
    console.log(`Found ${players.length} players for team ${team.name}`);
    
    if (players.length > 0) {
      displayInfo.playerStats = displayInfo.playerStats || {};
      displayInfo.playerStats[teamId] = {
        name: team.name,
        players: players.map(player => ({
          Name: player.Name || 'Unknown',
          RS: player.RS || '0',       // Runs scored
          OB: player.OB || '0',       // Overs bowled
          RC: player.RC || '0',       // Runs conceded
          Wkts: player.Wkts || '0',   // Wickets
          SR: player.SR || '0',       // Strike rate
          Econ: player.Econ || '0',   // Economy
          C: player.C || '0'          // Catches or Contribution
        }))
      };
    }
  });
  
  // Log the extracted player stats for debugging
  if (displayInfo.playerStats && Object.keys(displayInfo.playerStats).length > 0) {
    console.log("Successfully extracted player stats:", Object.keys(displayInfo.playerStats).length, "teams");
  } else {
    console.log("No player stats were extracted from MatchSummary");
  }
};
