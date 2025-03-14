
import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';

interface DataExtractorProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

/**
 * This component doesn't render anything visible - it just extracts data from the raw match data
 * and updates the displayInfo object if needed
 */
export const DataExtractor: React.FC<DataExtractorProps> = ({ displayInfo, matchData }) => {
  useEffect(() => {
    if (matchData && !displayInfo.venue) {
      // Try to get venue from Configuration
      if ((matchData.Configuration as any)?.PlayingAreaName) {
        displayInfo.venue = (matchData.Configuration as any).PlayingAreaName;
      }
      
      // Extract teams if not already set
      if ((!displayInfo.teams || displayInfo.teams.length === 0) && matchData.Teams?.Team) {
        const teams = Array.isArray(matchData.Teams.Team) ? 
          matchData.Teams.Team : [matchData.Teams.Team];
          
        displayInfo.teams = teams.map(team => ({
          id: team.Id,
          name: team.Name,
          isWinner: false
        }));
      }
      
      // Try to determine winner if not set
      if (!displayInfo.winner && displayInfo.teams && displayInfo.teams.length === 2) {
        if (matchData.Skins?.Skin) {
          const skins = Array.isArray(matchData.Skins.Skin) ? 
            matchData.Skins.Skin : [matchData.Skins.Skin];
          
          if (skins.length > 0) {
            const lastSkin = skins[skins.length - 1];
            const team1Score = parseInt(lastSkin.Team1Score || '0') + parseInt(lastSkin.Team1BonusPenaltyRuns || '0');
            const team2Score = parseInt(lastSkin.Team2Score || '0') + parseInt(lastSkin.Team2BonusPenaltyRuns || '0');
            
            if (team1Score > team2Score) {
              displayInfo.winner = displayInfo.teams[0].name;
              displayInfo.winnerId = displayInfo.teams[0].id;
              displayInfo.teams[0].isWinner = true;
            } else if (team2Score > team1Score) {
              displayInfo.winner = displayInfo.teams[1].name;
              displayInfo.winnerId = displayInfo.teams[1].id;
              displayInfo.teams[1].isWinner = true;
            } else {
              displayInfo.winner = "Draw";
            }
          }
        }
      }
      
      // Process player stats if not already done
      if ((!displayInfo.playerStats || Object.keys(displayInfo.playerStats).length === 0) && matchData.Teams?.Team) {
        const teams = Array.isArray(matchData.Teams.Team) ? 
          matchData.Teams.Team : [matchData.Teams.Team];
          
        displayInfo.playerStats = {};
        
        // First check if we have MatchSummary data
        if (matchData.MatchSummary?.team) {
          const summaryTeams = Array.isArray(matchData.MatchSummary.team) ? 
            matchData.MatchSummary.team : [matchData.MatchSummary.team];
            
          summaryTeams.forEach(team => {
            if (!team || !team.name) return;
            
            // Find team ID
            const matchingTeam = teams.find(t => t.Name === team.name);
            if (!matchingTeam) return;
            
            const teamId = matchingTeam.Id;
            const players = Array.isArray(team.player) ? team.player : team.player ? [team.player] : [];
            
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
          });
        } 
        // If no MatchSummary, try using Batsmen/Bowlers
        else if (matchData.Batsmen?.Batsman || matchData.Bowlers?.Bowler) {
          const batsmen = Array.isArray(matchData.Batsmen?.Batsman) ? 
            matchData.Batsmen?.Batsman : matchData.Batsmen?.Batsman ? [matchData.Batsmen.Batsman] : [];
            
          const bowlers = Array.isArray(matchData.Bowlers?.Bowler) ? 
            matchData.Bowlers?.Bowler : matchData.Bowlers?.Bowler ? [matchData.Bowlers.Bowler] : [];
            
          teams.forEach(team => {
            const teamId = team.Id;
            
            displayInfo.playerStats![teamId] = {
              name: team.Name,
              players: []
            };
            
            // Add players from both bowlers and batsmen lists
            const teamPlayers = new Set();
            
            [...batsmen, ...bowlers].forEach(player => {
              if (player.TeamId === teamId && !teamPlayers.has(player.Id)) {
                teamPlayers.add(player.Id);
                displayInfo.playerStats![teamId].players.push({
                  Name: player.Name,
                  RS: '0',
                  OB: '0',
                  RC: '0',
                  Wkts: '0',
                  SR: '0',
                  Econ: '0'
                });
              }
            });
          });
        }
      }
    }
  }, [matchData, displayInfo]);
  
  return null; // This component doesn't render anything
};

export default DataExtractor;
