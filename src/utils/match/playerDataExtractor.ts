
import { DisplayableMatchInfo } from '../../components/match/types';
import { MatchDetails, Team } from '../../types/cricket';
import { extractFromMatchSummary } from './playerStats/summaryExtractor';
import { extractFromBatsmenBowlers } from './playerStats/bowlerBatsmanExtractor';

// Extract player statistics from match data
export const extractPlayerStats = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  if (!matchData.Teams?.Team) return;
  
  const teams = Array.isArray(matchData.Teams.Team) ? 
    matchData.Teams.Team : [matchData.Teams.Team];
    
  displayInfo.playerStats = displayInfo.playerStats || {};
  
  console.log("Extracting player statistics");
  
  // First check if we have MatchSummary data
  if (matchData.MatchSummary?.team) {
    extractFromMatchSummary(matchData, teams, displayInfo);
  } 
  // If no MatchSummary, try using Batsmen/Bowlers
  else if (matchData.Batsmen?.Batsman || matchData.Bowlers?.Bowler) {
    extractFromBatsmenBowlers(matchData, teams, displayInfo);
  }
  
  // If still no player stats, add empty player lists to each team
  if (Object.keys(displayInfo.playerStats).length === 0) {
    teams.forEach(team => {
      displayInfo.playerStats![team.Id] = {
        name: team.Name,
        players: []
      };
    });
  }
};
