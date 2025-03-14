
import { Ball } from '../../../types/cricket';

// Process batsman statistics from a ball
export const processBatsmanStats = (
  ball: Ball,
  batsmanRuns: {[batsmanId: string]: number},
  batsmanBalls: {[batsmanId: string]: number}
): void => {
  const batsmanId = ball.BatsmanId;
  const batsmanTeamId = ball.BatsmanTeamId;
  
  if (batsmanId && batsmanTeamId) {
    if (!batsmanRuns[batsmanId]) batsmanRuns[batsmanId] = 0;
    batsmanRuns[batsmanId] += parseInt(ball.Score || '0');
    
    if (!batsmanBalls[batsmanId]) batsmanBalls[batsmanId] = 0;
    batsmanBalls[batsmanId]++;
  }
};
