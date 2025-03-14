
import { Ball } from '../../../types/cricket';

// Process bowler statistics from a ball
export const processBowlerStats = (
  ball: Ball,
  bowlerBalls: {[bowlerId: string]: number},
  bowlerRuns: {[bowlerId: string]: number},
  bowlerWickets: {[bowlerId: string]: number}
): void => {
  const bowlerId = ball.BowlerId;
  const bowlerTeamId = ball.BowlerTeamId;
  
  if (bowlerId && bowlerTeamId) {
    if (!bowlerBalls[bowlerId]) bowlerBalls[bowlerId] = 0;
    bowlerBalls[bowlerId]++;
    
    if (!bowlerRuns[bowlerId]) bowlerRuns[bowlerId] = 0;
    bowlerRuns[bowlerId] += parseInt(ball.Score || '0');
    
    if (!bowlerWickets[bowlerId]) bowlerWickets[bowlerId] = 0;
    if (ball.IsWicket === 'True') bowlerWickets[bowlerId]++;
  }
};
