
import { DisplayableMatchInfo } from '../../../components/match/types';
import { MatchDetails, PlayerMatchSummary, Team, TeamMatchSummary } from '../../../types/cricket';

// Extract player stats from MatchSummary data
export const extractFromMatchSummary = (
  matchData: MatchDetails,
  teams: Team[],
  displayInfo: DisplayableMatchInfo
): void => {
  console.log("Using MatchSummary data for player stats");
  
  if (!matchData.MatchSummary?.team) return;
  
  // Ensure we're dealing with an array of team summary data
  const summaryTeams = Array.isArray(matchData.MatchSummary.team) ? 
    matchData.MatchSummary.team : matchData.MatchSummary.team ? [matchData.MatchSummary.team] : [];
    
  summaryTeams.forEach(team => {
    if (!team || !team.name) return;
    
    // Find team ID by matching name
    const matchingTeam = teams.find(t => t.Name === team.name);
    if (!matchingTeam) return;
    
    const teamId = matchingTeam.Id;
    
    // Process player data, ensuring we handle both array and single player cases
    const players = Array.isArray(team.player) ? team.player : team.player ? [team.player] : [];
    
    if (players.length > 0) {
      displayInfo.playerStats![teamId] = {
        name: team.name,
        players: players.map(player => ({
          Name: player.Name || 'Unknown',
          RS: player.RS || '0',       // Runs scored
          OB: player.OB || '0',       // Overs bowled
          RC: player.RC || '0',       // Runs conceded
          Wkts: player.Wkts || '0',   // Wickets
          SR: player.SR || '0',       // Strike rate
          Econ: player.Econ || '0',   // Economy
          C: player.C || '0'          // Catches (or contribution)
        }))
      };
    }
  });
  
  // Check if we have a Man of the Match
  if (matchData.MatchSummary.manOfMatch && typeof matchData.MatchSummary.manOfMatch === 'string') {
    displayInfo.manOfMatch = matchData.MatchSummary.manOfMatch;
  }
};
