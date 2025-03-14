
import { DisplayableMatchInfo } from '../../../components/match/types';
import { Ball, BowlerBatsman } from '../../../types/cricket';
import { processBowlerStats } from './bowlerStatsProcessor';
import { processBatsmanStats } from './batsmanStatsProcessor';
import { updatePlayerStatsWithCalculatedValues } from './playerStatsUpdater';

// Calculate player stats from ball-by-ball data
export const calculateStatsFromBalls = (
  balls: Ball[],
  batsmen: BowlerBatsman[],
  bowlers: BowlerBatsman[],
  displayInfo: DisplayableMatchInfo
): void => {
  // Initialize stats counters
  const bowlerBalls: {[bowlerId: string]: number} = {};
  const bowlerRuns: {[bowlerId: string]: number} = {};
  const bowlerWickets: {[bowlerId: string]: number} = {};
  
  const batsmanRuns: {[batsmanId: string]: number} = {};
  const batsmanBalls: {[batsmanId: string]: number} = {};
  
  // Process each ball to gather statistics
  balls.forEach(ball => {
    processBowlerStats(ball, bowlerBalls, bowlerRuns, bowlerWickets);
    processBatsmanStats(ball, batsmanRuns, batsmanBalls);
  });
  
  // Update player stats with the calculated values
  applyCalculatedStats(
    displayInfo,
    bowlers,
    bowlerBalls,
    bowlerRuns,
    bowlerWickets,
    batsmen,
    batsmanRuns,
    batsmanBalls
  );
};

// Apply calculated stats to all teams in displayInfo
const applyCalculatedStats = (
  displayInfo: DisplayableMatchInfo,
  bowlers: BowlerBatsman[],
  bowlerBalls: {[bowlerId: string]: number},
  bowlerRuns: {[bowlerId: string]: number},
  bowlerWickets: {[bowlerId: string]: number},
  batsmen: BowlerBatsman[],
  batsmanRuns: {[batsmanId: string]: number},
  batsmanBalls: {[batsmanId: string]: number}
): void => {
  // Skip if no player stats object exists
  if (!displayInfo.playerStats) return;
  
  // Process each team's player stats
  Object.keys(displayInfo.playerStats).forEach(teamId => {
    updatePlayerStatsWithCalculatedValues(
      displayInfo, 
      teamId, 
      bowlers, 
      bowlerBalls, 
      bowlerRuns, 
      bowlerWickets, 
      batsmen, 
      batsmanRuns, 
      batsmanBalls
    );
  });
};
