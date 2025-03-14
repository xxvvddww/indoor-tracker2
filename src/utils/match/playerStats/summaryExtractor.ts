
import { DisplayableMatchInfo } from '../../../components/match/types';
import { MatchDetails, Team } from '../../../types/cricket';

// Extract player stats from MatchSummary data
export const extractFromMatchSummary = (
  matchData: MatchDetails,
  teams: Team[],
  displayInfo: DisplayableMatchInfo
): void => {
  console.log("Using MatchSummary data for player stats");
  
  if (!matchData.MatchSummary?.team) return;
  
  const summaryTeams = Array.isArray(matchData.MatchSummary.team) ? 
    matchData.MatchSummary.team : matchData.MatchSummary.team ? [matchData.MatchSummary.team] : [];
    
  summaryTeams.forEach(team => {
    if (!team || !team.name) return;
    
    // Find team ID
    const matchingTeam = teams.find(t => t.Name === team.name);
    if (!matchingTeam) return;
    
    const teamId = matchingTeam.Id;
    const players = Array.isArray(team.player) ? team.player : team.player ? [team.player] : [];
    
    if (players.length > 0) {
      displayInfo.playerStats![teamId] = {
        name: team.name,
        players: players.map(player => ({
          Name: player.Name || 'Unknown',
          RS: player.RS || '0',
          OB: player.OB || '0',
          RC: player.RC || '0',
          Wkts: player.Wkts || '0',
          SR: player.SR || '0',
          Econ: player.Econ || '0'
        }))
      };
    }
  });
};
