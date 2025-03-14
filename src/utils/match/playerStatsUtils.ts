
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails, BowlerBatsman } from "../../types/cricket";
import { extractPlayerStatsFromMatch } from "./playerStats/extractorService";

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
          name: matchData.Configuration.Team1Name || `Team 1 (ID: ${matchData.Configuration.Team1Id})`,
          isWinner: false
        },
        {
          id: matchData.Configuration.Team2Id,
          name: matchData.Configuration.Team2Name || `Team 2 (ID: ${matchData.Configuration.Team2Id})`,
          isWinner: false
        }
      ];
      console.log("Added fallback teams from Configuration");
    }
    // If still no teams, try another approach
    else if (Array.isArray(matchData) && matchData[0]) {
      displayInfo.teams = [
        {
          id: "team1",
          name: "Home Team",
          isWinner: false
        },
        {
          id: "team2",
          name: "Away Team",
          isWinner: false
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
  
  // Try array-based data format first (common in some responses)
  if (Array.isArray(matchData) && matchData.length > 0) {
    console.log("Handling array-based match data format");
    extractPlayersFromArrayData(matchData, displayInfo);
    
    // Check if we got any players
    let playersFound = false;
    if (displayInfo.playerStats) {
      Object.keys(displayInfo.playerStats).forEach(teamId => {
        if (displayInfo.playerStats![teamId].players.length > 0) {
          playersFound = true;
        }
      });
    }
    
    // If we found players, we're done
    if (playersFound) {
      console.log("Successfully extracted players from array data");
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
  
  // Check if we have specialized extraction service available
  if (typeof extractPlayerStatsFromMatch === 'function') {
    extractPlayerStatsFromMatch(matchData, displayInfo);
    
    // Check if any players were extracted
    let playersFound = false;
    Object.keys(displayInfo.playerStats).forEach(teamId => {
      if (displayInfo.playerStats![teamId].players.length > 0) {
        playersFound = true;
      }
    });
    
    // If players were found, we're done
    if (playersFound) {
      console.log("Successfully extracted players using the extraction service");
      return;
    }
  }
  
  // Traditional extraction methods
  const extractedFromSummary = extractFromMatchSummary(matchData, displayInfo);
  
  // If no data from summary, try from Batsmen/Bowlers
  if (!extractedFromSummary) {
    const extractedFromBatsBowls = extractFromBatsmenBowlers(matchData, displayInfo);
    
    // If still no data, try from ball-by-ball data
    if (!extractedFromBatsBowls) {
      extractFromBallData(matchData, displayInfo);
    }
  }
  
  // Check if we got any players
  let totalPlayers = 0;
  Object.keys(displayInfo.playerStats).forEach(teamId => {
    totalPlayers += displayInfo.playerStats![teamId].players.length;
  });
  
  // Add fallback data if no players were found
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

// Extract players from array-based data format
const extractPlayersFromArrayData = (matchData: any[], displayInfo: DisplayableMatchInfo): boolean => {
  // If the first element has Players property, try to extract from there
  if (matchData[0] && matchData[0].Players && matchData[0].Players.Player) {
    console.log("Found Players data in array format");
    
    const players = Array.isArray(matchData[0].Players.Player) ? 
      matchData[0].Players.Player : [matchData[0].Players.Player];
    
    // Group players by team
    const teamPlayerMap = new Map<string, any[]>();
    
    players.forEach(player => {
      if (player.TeamId) {
        if (!teamPlayerMap.has(player.TeamId)) {
          teamPlayerMap.set(player.TeamId, []);
        }
        teamPlayerMap.get(player.TeamId)!.push(player);
      }
    });
    
    // Initialize player stats if needed
    displayInfo.playerStats = displayInfo.playerStats || {};
    
    // Process each team
    displayInfo.teams.forEach(team => {
      const teamPlayers = teamPlayerMap.get(team.id) || [];
      
      // Initialize team stats if needed
      if (!displayInfo.playerStats![team.id]) {
        displayInfo.playerStats![team.id] = {
          name: team.name,
          players: []
        };
      }
      
      // Add players to team
      if (teamPlayers.length > 0) {
        displayInfo.playerStats![team.id].players = teamPlayers.map(player => ({
          Name: player.Name || player.UserName || 'Unknown',
          RS: player.RunsScored || '0',
          OB: player.Overs || '0',
          RC: player.RunsConceded || '0',
          Wkts: player.Wickets || '0',
          SR: player.BallsFaced ? 
            ((parseInt(player.RunsScored || '0') / parseInt(player.BallsFaced)) * 100).toFixed(1) : '0',
          Econ: player.Overs && player.RunsConceded ? 
            (parseInt(player.RunsConceded) / parseInt(player.Overs)).toFixed(1) : '0',
          PlayerId: player.Id || player.PlayerId
        }));
      }
    });
    
    return true;
  }
  
  return false;
};

// Extract from MatchSummary data
const extractFromMatchSummary = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): boolean => {
  if (!matchData.MatchSummary?.team) return false;
  
  console.log("Extracting player stats from MatchSummary");
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
        Name: p.Name || 'Unknown',
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
  
  console.log("Extracting player stats from Batsmen/Bowlers data");
  let playersExtracted = false;
  
  // Process batsmen
  if (matchData.Batsmen?.Batsman) {
    const batsmen = Array.isArray(matchData.Batsmen.Batsman) 
      ? matchData.Batsmen.Batsman 
      : [matchData.Batsmen.Batsman];
      
    batsmen.forEach(batsman => {
      // Find which team this batsman belongs to
      const teamId = findTeamIdForPlayer(batsman, displayInfo);
      if (!teamId) return;
      
      // Add or update player
      const playerIndex = displayInfo.playerStats![teamId].players.findIndex(
        p => p.Name === batsman.Name || p.PlayerId === batsman.Id
      );
      
      if (playerIndex >= 0) {
        // Update existing player
        displayInfo.playerStats![teamId].players[playerIndex].RS = batsman.RunsScored || '0';
        displayInfo.playerStats![teamId].players[playerIndex].SR = batsman.StrikeRate || '0';
        if (batsman.Id) {
          displayInfo.playerStats![teamId].players[playerIndex].PlayerId = batsman.Id;
        }
      } else {
        // Add new player
        displayInfo.playerStats![teamId].players.push({
          Name: batsman.Name || 'Unknown Batsman',
          RS: batsman.RunsScored || '0',
          OB: '0',
          RC: '0',
          Wkts: '0',
          SR: batsman.StrikeRate || '0',
          Econ: '0',
          PlayerId: batsman.Id || ''
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
      // Find which team this bowler belongs to
      const teamId = findTeamIdForPlayer(bowler, displayInfo);
      if (!teamId) return;
      
      // Add or update player
      const playerIndex = displayInfo.playerStats![teamId].players.findIndex(
        p => p.Name === bowler.Name || p.PlayerId === bowler.Id
      );
      
      if (playerIndex >= 0) {
        // Update existing player
        displayInfo.playerStats![teamId].players[playerIndex].OB = bowler.OversBowled || '0';
        displayInfo.playerStats![teamId].players[playerIndex].RC = bowler.RunsConceded || '0';
        displayInfo.playerStats![teamId].players[playerIndex].Wkts = bowler.Wickets || '0';
        displayInfo.playerStats![teamId].players[playerIndex].Econ = bowler.Economy || '0';
        if (bowler.Id) {
          displayInfo.playerStats![teamId].players[playerIndex].PlayerId = bowler.Id;
        }
      } else {
        // Add new player
        displayInfo.playerStats![teamId].players.push({
          Name: bowler.Name || 'Unknown Bowler',
          RS: '0',
          OB: bowler.OversBowled || '0',
          RC: bowler.RunsConceded || '0',
          Wkts: bowler.Wickets || '0',
          SR: '0',
          Econ: bowler.Economy || '0',
          PlayerId: bowler.Id || ''
        });
      }
      
      playersExtracted = true;
    });
  }
  
  return playersExtracted;
};

// Helper to find which team a player belongs to
const findTeamIdForPlayer = (player: BowlerBatsman, displayInfo: DisplayableMatchInfo): string | null => {
  // Direct match by TeamId
  if (player.TeamId) {
    const team = displayInfo.teams?.find(t => t.id === player.TeamId);
    if (team) return team.id;
  }
  
  // Try matching by TeamName
  if (player.TeamName) {
    const team = displayInfo.teams?.find(t => t.name === player.TeamName);
    if (team) return team.id;
  }
  
  // If only two teams, assign to alternating teams
  if (displayInfo.teams && displayInfo.teams.length === 2) {
    const playerCount1 = displayInfo.playerStats![displayInfo.teams[0].id].players.length;
    const playerCount2 = displayInfo.playerStats![displayInfo.teams[1].id].players.length;
    
    return playerCount1 <= playerCount2 ? displayInfo.teams[0].id : displayInfo.teams[1].id;
  }
  
  return null;
};

// Extract from ball-by-ball data
const extractFromBallData = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): boolean => {
  if (!matchData.Balls?.Ball) return false;
  
  console.log("Extracting player stats from ball-by-ball data");
  const balls = Array.isArray(matchData.Balls.Ball) ? 
    matchData.Balls.Ball : [matchData.Balls.Ball];
  
  // Extract unique players from ball data
  const batsmenMap = new Map<string, {id: string, name: string, teamId: string}>();
  const bowlerMap = new Map<string, {id: string, name: string, teamId: string}>();
  
  balls.forEach(ball => {
    if (ball.BatsmanId && ball.BatsmanName) {
      batsmenMap.set(ball.BatsmanId, {
        id: ball.BatsmanId,
        name: ball.BatsmanName,
        teamId: ball.BatsmanTeamId
      });
    }
    
    if (ball.BowlerId && ball.BowlerName) {
      bowlerMap.set(ball.BowlerId, {
        id: ball.BowlerId,
        name: ball.BowlerName,
        teamId: ball.BowlerTeamId
      });
    }
  });
  
  // Add players to their respective teams
  let playersAdded = false;
  
  // Add batsmen
  batsmenMap.forEach(batsman => {
    const team = displayInfo.teams?.find(t => t.id === batsman.teamId);
    if (!team) return;
    
    // Check if player already exists
    const playerIndex = displayInfo.playerStats![team.id].players.findIndex(
      p => p.Name === batsman.name || p.PlayerId === batsman.id
    );
    
    if (playerIndex === -1) {
      // Add new player
      displayInfo.playerStats![team.id].players.push({
        Name: batsman.name,
        RS: '0',
        OB: '0',
        RC: '0',
        Wkts: '0',
        SR: '0',
        Econ: '0',
        PlayerId: batsman.id
      });
      playersAdded = true;
    }
  });
  
  // Add bowlers
  bowlerMap.forEach(bowler => {
    const team = displayInfo.teams?.find(t => t.id === bowler.teamId);
    if (!team) return;
    
    // Check if player already exists
    const playerIndex = displayInfo.playerStats![team.id].players.findIndex(
      p => p.Name === bowler.name || p.PlayerId === bowler.id
    );
    
    if (playerIndex === -1) {
      // Add new player
      displayInfo.playerStats![team.id].players.push({
        Name: bowler.name,
        RS: '0',
        OB: '0',
        RC: '0',
        Wkts: '0',
        SR: '0',
        Econ: '0',
        PlayerId: bowler.id
      });
      playersAdded = true;
    }
  });
  
  // Now calculate statistics for each player
  if (playersAdded || displayInfo.teams.some(team => displayInfo.playerStats![team.id].players.length > 0)) {
    calculateBallStatistics(balls, displayInfo);
    return true;
  }
  
  return playersAdded;
};

// Calculate player statistics from ball data
const calculateBallStatistics = (balls: any[], displayInfo: DisplayableMatchInfo): void => {
  // Initialize player stats maps
  const batsmanStats = new Map<string, {runs: number, balls: number}>();
  const bowlerStats = new Map<string, {overs: number, runs: number, wickets: number}>();
  
  // Process each ball to gather statistics
  balls.forEach(ball => {
    const batsmanId = ball.BatsmanId;
    const bowlerId = ball.BowlerId;
    const runs = parseInt(ball.Score || '0');
    const isWicket = ball.IsWicket === 'True' || ball.IsWicket === 'true' || ball.IsWicket === '1';
    
    // Update batsman stats
    if (batsmanId) {
      if (!batsmanStats.has(batsmanId)) {
        batsmanStats.set(batsmanId, {runs: 0, balls: 0});
      }
      const stats = batsmanStats.get(batsmanId)!;
      stats.runs += runs;
      stats.balls += 1;
    }
    
    // Update bowler stats
    if (bowlerId) {
      if (!bowlerStats.has(bowlerId)) {
        bowlerStats.set(bowlerId, {overs: 0, runs: 0, wickets: 0});
      }
      const stats = bowlerStats.get(bowlerId)!;
      stats.runs += runs;
      if (isWicket) {
        stats.wickets += 1;
      }
      
      // Crude over calculation - increment by 0.1 for each ball, every 6 balls becomes 1 over
      stats.overs += 0.1;
      if (Math.round(stats.overs * 10) % 10 === 6) {
        stats.overs = Math.floor(stats.overs) + 1;
      }
    }
  });
  
  // Update player statistics in displayInfo
  displayInfo.teams.forEach(team => {
    displayInfo.playerStats![team.id].players.forEach(player => {
      // Find player ID
      const playerId = player.PlayerId;
      if (!playerId) return;
      
      // Update batsman stats
      if (batsmanStats.has(playerId)) {
        const stats = batsmanStats.get(playerId)!;
        player.RS = stats.runs.toString();
        // Calculate strike rate if balls > 0
        if (stats.balls > 0) {
          player.SR = ((stats.runs / stats.balls) * 100).toFixed(1);
        }
      }
      
      // Update bowler stats
      if (bowlerStats.has(playerId)) {
        const stats = bowlerStats.get(playerId)!;
        player.OB = stats.overs.toFixed(1);
        player.RC = stats.runs.toString();
        player.Wkts = stats.wickets.toString();
        // Calculate economy if overs > 0
        if (stats.overs > 0) {
          player.Econ = (stats.runs / stats.overs).toFixed(1);
        }
      }
    });
  });
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
