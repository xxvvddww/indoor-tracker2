
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
  // Count balls, runs, and wickets for each bowler
  const bowlerBalls: {[bowlerId: string]: number} = {};
  const bowlerRuns: {[bowlerId: string]: number} = {};
  const bowlerWickets: {[bowlerId: string]: number} = {};
  
  // Count runs and balls for each batsman
  const batsmanRuns: {[batsmanId: string]: number} = {};
  const batsmanBalls: {[batsmanId: string]: number} = {};
  
  // Process each ball to gather statistics
  balls.forEach(ball => {
    processBowlerStats(ball, bowlerBalls, bowlerRuns, bowlerWickets);
    processBatsmanStats(ball, batsmanRuns, batsmanBalls);
  });
  
  // Update player stats with calculated values
  Object.keys(displayInfo.playerStats!).forEach(teamId => {
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
