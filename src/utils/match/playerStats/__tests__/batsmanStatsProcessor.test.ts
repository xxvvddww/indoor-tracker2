
import { Ball } from '../../../../types/cricket';
import { processBatsmanStats } from '../batsmanStatsProcessor';

describe('processBatsmanStats', () => {
  it('should increment runs and balls faced for a batsman', () => {
    const ball: Ball = {
      BatsmanId: 'batter1',
      BatsmanTeamId: 'team1',
      Score: '4',
      OverNumber: '1',
      BallNumber: '3',
      BowlerId: 'bowler1',
      BowlerTeamId: 'team2',
      Result: 'boundary',
      Extras: '',
      IsWicket: 'False',
      OverId: '1'
    };
    
    const batsmanRuns: {[id: string]: number} = {};
    const batsmanBalls: {[id: string]: number} = {};
    
    processBatsmanStats(ball, batsmanRuns, batsmanBalls);
    
    expect(batsmanRuns['batter1']).toBe(4);
    expect(batsmanBalls['batter1']).toBe(1);
  });
  
  it('should handle missing batsman ID', () => {
    const ball: Ball = {
      BatsmanId: undefined,
      BatsmanTeamId: 'team1',
      Score: '1',
      OverNumber: '1',
      BallNumber: '4',
      BowlerId: 'bowler1',
      BowlerTeamId: 'team2',
      Result: 'single',
      Extras: '',
      IsWicket: 'False',
      OverId: '1'
    };
    
    const batsmanRuns: {[id: string]: number} = {};
    const batsmanBalls: {[id: string]: number} = {};
    
    processBatsmanStats(ball, batsmanRuns, batsmanBalls);
    
    expect(Object.keys(batsmanRuns).length).toBe(0);
    expect(Object.keys(batsmanBalls).length).toBe(0);
  });
});
