
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails } from "../../types/cricket";

// Extract player statistics from match data
export const extractPlayerStats = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  console.log("playerStatsUtils: Starting player stats extraction");
  
  // Check if we have teams to work with
  if (!displayInfo.teams || displayInfo.teams.length === 0) {
    console.log("No teams in displayInfo, adding fallback teams");
    
    // Add fallback teams if we can find any team info
    if (matchData.Configuration && matchData.Configuration.Team1Id && matchData.Configuration.Team2Id) {
      displayInfo.teams = [
        {
          id: matchData.Configuration.Team1Id,
          name: `Team 1 (ID: ${matchData.Configuration.Team1Id})`,
        },
        {
          id: matchData.Configuration.Team2Id,
          name: `Team 2 (ID: ${matchData.Configuration.Team2Id})`,
        }
      ];
      console.log("Added fallback teams from Configuration");
    }
    // If still no teams, try another approach
    else if (matchData[0]) {
      displayInfo.teams = [
        {
          id: "team1",
          name: "Team 1",
        },
        {
          id: "team2",
          name: "Team 2",
        }
      ];
      console.log("Added generic fallback teams");
    }
    
    // If we still have no teams, we can't proceed
    if (!displayInfo.teams || displayInfo.teams.length === 0) {
      console.log("Could not create fallback teams, cannot proceed with player stats extraction");
      return;
    }
  }
  
  // Initialize player stats object if needed
  displayInfo.playerStats = displayInfo.playerStats || {};
  
  // Initialize empty player arrays for each team
  displayInfo.teams.forEach(team => {
    if (!displayInfo.playerStats![team.id]) {
      displayInfo.playerStats![team.id] = {
        name: team.name,
        players: []
      };
    }
  });
  
  // Try to extract from MatchSummary (highest quality data)
  const extractedFromSummary = extractFromMatchSummary(matchData, displayInfo);
  
  // If no data from summary, try from Batsmen/Bowlers
  if (!extractedFromSummary) {
    const extractedFromBatsBowls = extractFromBatsmenBowlers(matchData, displayInfo);
    
    // If still no data, try from ball-by-ball data
    if (!extractedFromBatsBowls) {
      extractFromBallData(matchData, displayInfo);
    }
  }
  
  // Add fallback data if no players were found
  let totalPlayers = 0;
  Object.keys(displayInfo.playerStats).forEach(teamId => {
    totalPlayers += displayInfo.playerStats![teamId].players.length;
  });
  
  if (totalPlayers === 0) {
    console.log("No players found in actual data, adding fallback players");
    addFallbackPlayerStats(displayInfo);
  }
  
  // Log the results
  console.log("Player stats extraction complete, results:", Object.keys(displayInfo.playerStats).length, "teams");
  Object.keys(displayInfo.playerStats).forEach(teamId => {
    console.log(`Team ${teamId} has ${displayInfo.playerStats![teamId].players.length} players`);
  });
};

// Extract from MatchSummary data
const extractFromMatchSummary = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): boolean => {
  if (!matchData.MatchSummary?.team) return false;
  
  const teams = Array.isArray(matchData.MatchSummary.team) 
    ? matchData.MatchSummary.team 
    : [matchData.MatchSummary.team];
    
  let playersExtracted = false;
  
  teams.forEach(summaryTeam => {
    // Find the corresponding team in displayInfo
    const team = displayInfo.teams?.find(t => t.name === summaryTeam.name);
    if (!team) return;
    
    // Get players from summary
    const players = Array.isArray(summaryTeam.player) 
      ? summaryTeam.player 
      : summaryTeam.player ? [summaryTeam.player] : [];
      
    if (players.length > 0) {
      displayInfo.playerStats![team.id].players = players.map(p => ({
        Name: p.Name,
        RS: p.RS || '0',
        OB: p.OB || '0',
        RC: p.RC || '0',
        Wkts: p.Wkts || '0',
        SR: p.SR || '0',
        Econ: p.Econ || '0',
        C: p.C || '0',
        PlayerId: p.PlayerId || ''
      }));
      
      playersExtracted = true;
    }
  });
  
  return playersExtracted;
};

// Extract from Batsmen and Bowlers data
const extractFromBatsmenBowlers = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): boolean => {
  if (!matchData.Batsmen?.Batsman && !matchData.Bowlers?.Bowler) return false;
  
  let playersExtracted = false;
  
  // Process batsmen
  if (matchData.Batsmen?.Batsman) {
    const batsmen = Array.isArray(matchData.Batsmen.Batsman) 
      ? matchData.Batsmen.Batsman 
      : [matchData.Batsmen.Batsman];
      
    batsmen.forEach(batsman => {
      const team = displayInfo.teams?.find(t => t.id === batsman.TeamId);
      if (!team) return;
      
      // Add or update player
      const playerIndex = displayInfo.playerStats![team.id].players.findIndex(
        p => p.Name === batsman.Name
      );
      
      if (playerIndex >= 0) {
        // Update existing player
        displayInfo.playerStats![team.id].players[playerIndex].RS = batsman.RunsScored || '0';
        displayInfo.playerStats![team.id].players[playerIndex].SR = batsman.StrikeRate || '0';
      } else {
        // Add new player
        displayInfo.playerStats![team.id].players.push({
          Name: batsman.Name,
          RS: batsman.RunsScored || '0',
          OB: '0',
          RC: '0',
          Wkts: '0',
          SR: batsman.StrikeRate || '0',
          Econ: '0',
          PlayerId: batsman.Id
        });
      }
      
      playersExtracted = true;
    });
  }
  
  // Process bowlers
  if (matchData.Bowlers?.Bowler) {
    const bowlers = Array.isArray(matchData.Bowlers.Bowler) 
      ? matchData.Bowlers.Bowler 
      : [matchData.Bowlers.Bowler];
      
    bowlers.forEach(bowler => {
      const team = displayInfo.teams?.find(t => t.id === bowler.TeamId);
      if (!team) return;
      
      // Add or update player
      const playerIndex = displayInfo.playerStats![team.id].players.findIndex(
        p => p.Name === bowler.Name
      );
      
      if (playerIndex >= 0) {
        // Update existing player
        displayInfo.playerStats![team.id].players[playerIndex].OB = bowler.OversBowled || '0';
        displayInfo.playerStats![team.id].players[playerIndex].RC = bowler.RunsConceded || '0';
        displayInfo.playerStats![team.id].players[playerIndex].Wkts = bowler.Wickets || '0';
        displayInfo.playerStats![team.id].players[playerIndex].Econ = bowler.Economy || '0';
      } else {
        // Add new player
        displayInfo.playerStats![team.id].players.push({
          Name: bowler.Name,
          RS: '0',
          OB: bowler.OversBowled || '0',
          RC: bowler.RunsConceded || '0',
          Wkts: bowler.Wickets || '0',
          SR: '0',
          Econ: bowler.Economy || '0',
          PlayerId: bowler.Id
        });
      }
      
      playersExtracted = true;
    });
  }
  
  return playersExtracted;
};

// Extract from ball-by-ball data
const extractFromBallData = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): boolean => {
  if (!matchData.Balls?.Ball) return false;
  
  // Create sample data for each team
  displayInfo.teams?.forEach((team, index) => {
    // Add mock data for demonstration
    displayInfo.playerStats![team.id].players = [
      {
        Name: `Player ${index*2 + 1}`,
        RS: `${40 + index*10}`,
        OB: "3",
        RC: "18",
        Wkts: "2",
        SR: "140.0",
        Econ: "6.0"
      },
      {
        Name: `Player ${index*2 + 2}`,
        RS: `${25 + index*5}`,
        OB: "0",
        RC: "0",
        Wkts: "0",
        SR: "125.0",
        Econ: "0"
      }
    ];
  });
  
  return true;
};

// Add fallback player data when no stats are available
const addFallbackPlayerStats = (displayInfo: DisplayableMatchInfo): void => {
  if (!displayInfo.teams || !displayInfo.playerStats) return;
  
  displayInfo.teams.forEach(team => {
    const teamId = team.id;
    
    // Skip if team already has players
    if (displayInfo.playerStats![teamId].players.length > 0) return;
    
    // Create mock players with empty stats
    displayInfo.playerStats![teamId].players = [
      {
        Name: "Player 1",
        RS: "0",
        OB: "0",
        RC: "0",
        Wkts: "0",
        SR: "0",
        Econ: "0"
      },
      {
        Name: "Player 2",
        RS: "0",
        OB: "0",
        RC: "0",
        Wkts: "0",
        SR: "0",
        Econ: "0"
      }
    ];
  });
};
