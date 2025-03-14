import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import { formatDate } from '../../utils/dateFormatters';

interface DataExtractorProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const DataExtractor: React.FC<DataExtractorProps> = ({ displayInfo, matchData }) => {
  useEffect(() => {
    if (!matchData) return;
    
    console.log("DataExtractor processing match data");
    
    // Extract basic match info
    extractBasicInfo(matchData, displayInfo);
    
    // Extract teams info
    extractTeamsInfo(matchData, displayInfo);
    
    // Extract player stats
    extractPlayerStats(matchData, displayInfo);
    
  }, [matchData, displayInfo]);
  
  return null; // This component doesn't render anything
};

const extractBasicInfo = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo) => {
  // Set title using Teams data if available
  if (!displayInfo.title || displayInfo.title === "Match Information") {
    const teams = matchData.Teams?.Team;
    if (teams && Array.isArray(teams) && teams.length >= 2) {
      displayInfo.title = `${teams[0].Name} vs ${teams[1].Name}`;
    }
  }
  
  // Try to get and format date from Configuration
  if (!displayInfo.date && matchData.Configuration) {
    try {
      const startTimeStr = (matchData.Configuration as any)?.Team1InningsStartTime;
      if (startTimeStr && typeof startTimeStr === 'string') {
        displayInfo.date = formatDate(startTimeStr);
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  }
};

const extractTeamsInfo = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo) => {
  // Extract teams if not already set
  if ((!displayInfo.teams || displayInfo.teams.length === 0) && matchData.Teams?.Team) {
    console.log("Extracting team information");
    
    const teams = Array.isArray(matchData.Teams.Team) ? 
      matchData.Teams.Team : [matchData.Teams.Team];
      
    displayInfo.teams = teams.map(team => ({
      id: team.Id,
      name: team.Name,
      isWinner: false
    }));
    
    // Try to determine winner
    determineMatchWinner(matchData, displayInfo);
  }
};

const determineMatchWinner = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo) => {
  if (!displayInfo.teams || displayInfo.teams.length !== 2) return;
  
  // First try to get winner from Skins
  if (matchData.Skins?.Skin) {
    const skins = Array.isArray(matchData.Skins.Skin) ? 
      matchData.Skins.Skin : [matchData.Skins.Skin];
    
    if (skins.length > 0) {
      const lastSkin = skins[skins.length - 1];
      const team1Score = parseInt(lastSkin.Team1Score || '0') + parseInt(lastSkin.Team1BonusPenaltyRuns || '0');
      const team2Score = parseInt(lastSkin.Team2Score || '0') + parseInt(lastSkin.Team2BonusPenaltyRuns || '0');
      
      const team1Id = lastSkin.Team1Id;
      const team2Id = lastSkin.Team2Id;
      
      const team1 = displayInfo.teams.find(t => t.id === team1Id);
      const team2 = displayInfo.teams.find(t => t.id === team2Id);
      
      if (team1 && team2) {
        // Set result string without points
        displayInfo.result = `${team1.name} vs ${team2.name}`;
        
        if (team1Score > team2Score) {
          displayInfo.winner = team1.name;
          displayInfo.winnerId = team1.id;
          displayInfo.teams.forEach(t => {
            if (t.id === team1.id) t.isWinner = true;
          });
        } else if (team2Score > team1Score) {
          displayInfo.winner = team2.name;
          displayInfo.winnerId = team2.id;
          displayInfo.teams.forEach(t => {
            if (t.id === team2.id) t.isWinner = true;
          });
        } else {
          displayInfo.winner = "Draw";
        }
      }
    }
  }
  
  // If no winner determined, try using Teams points
  if (!displayInfo.winner && matchData.Teams?.Team) {
    const teams = Array.isArray(matchData.Teams.Team) ? 
      matchData.Teams.Team : [matchData.Teams.Team];
    
    if (teams.length === 2 && teams[0].Points && teams[1].Points) {
      const team1Points = parseInt(teams[0].Points);
      const team2Points = parseInt(teams[1].Points);
      
      // Set result without points
      displayInfo.result = `${teams[0].Name} vs ${teams[1].Name}`;
      
      if (team1Points > team2Points) {
        displayInfo.winner = teams[0].Name;
        displayInfo.winnerId = teams[0].Id;
        if (displayInfo.teams) displayInfo.teams[0].isWinner = true;
      } else if (team2Points > team1Points) {
        displayInfo.winner = teams[1].Name;
        displayInfo.winnerId = teams[1].Id;
        if (displayInfo.teams) displayInfo.teams[1].isWinner = true;
      } else {
        displayInfo.winner = "Draw";
      }
    }
  }
};

const extractPlayerStats = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo) => {
  if (!matchData.Teams?.Team) return;
  
  const teams = Array.isArray(matchData.Teams.Team) ? 
    matchData.Teams.Team : [matchData.Teams.Team];
    
  displayInfo.playerStats = displayInfo.playerStats || {};
  
  console.log("Extracting player statistics");
  
  // First check if we have MatchSummary data
  if (matchData.MatchSummary?.team) {
    console.log("Using MatchSummary data for player stats");
    
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
            Econ: player.Econ || '0',
            C: player.C || '0'
          }))
        };
      }
    });
  } 
  // If no MatchSummary, try using Batsmen/Bowlers
  else if (matchData.Batsmen?.Batsman || matchData.Bowlers?.Bowler) {
    console.log("Using Batsmen/Bowlers data for player stats");
    
    const batsmen = matchData.Batsmen?.Batsman ? 
      (Array.isArray(matchData.Batsmen.Batsman) ? matchData.Batsmen.Batsman : [matchData.Batsmen.Batsman]) : [];
      
    const bowlers = matchData.Bowlers?.Bowler ? 
      (Array.isArray(matchData.Bowlers.Bowler) ? matchData.Bowlers.Bowler : [matchData.Bowlers.Bowler]) : [];
      
    teams.forEach(team => {
      const teamId = team.Id;
      
      if (!displayInfo.playerStats![teamId]) {
        displayInfo.playerStats![teamId] = {
          name: team.Name,
          players: []
        };
      }
      
      // Add players from both bowlers and batsmen lists
      const teamPlayers = new Set();
      
      [...batsmen, ...bowlers].forEach(player => {
        if (player.TeamId === teamId && !teamPlayers.has(player.Id)) {
          teamPlayers.add(player.Id);
          displayInfo.playerStats![teamId].players.push({
            Name: player.Name || 'Unknown',
            RS: '0', // Default values since these aren't in the type
            OB: '0',
            RC: '0',
            Wkts: '0',
            SR: '0',
            Econ: '0',
            C: '0'
          });
        }
      });
    });
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

const cleanUpResultDisplay = (displayInfo: DisplayableMatchInfo) => {
  // Clean up Man of Match display
  if (displayInfo.manOfMatch) {
    // Remove any "Player of the match:" prefix if it exists
    displayInfo.manOfMatch = displayInfo.manOfMatch.replace(/Player of the match:\s*/i, '');
    displayInfo.manOfMatch = displayInfo.manOfMatch.replace(/Man of the match:\s*/i, '');
  }
  
  // Clean up winner display
  if (displayInfo.winner) {
    // Remove any "by X points" or similar suffix
    displayInfo.winner = displayInfo.winner.replace(/\s+\(.*\)/, '');
    displayInfo.winner = displayInfo.winner.replace(/\s+by.*/, '');
  }
};

export default DataExtractor;
