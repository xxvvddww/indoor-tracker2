
import { Ball } from '../../../../types/cricket';
import { processBowlerStats } from '../bowlerStatsProcessor';

describe('processBowlerStats', () => {
  it('should increment balls, runs and wickets for a bowler', () => {
    const ball: Ball = {
      BowlerId: 'bowler1',
      BowlerTeamId: 'team2',
      Score: '1',
      IsWicket: 'True',
      OverNumber: '1',
      BallNumber: '3',
      BatsmanId: 'batter1',
      BatsmanTeamId: 'team1',
      Result: 'out',
      Extras: '',
      OverId: '1'
    };
    
    const bowlerBalls: {[id: string]: number} = {};
    const bowlerRuns: {[id: string]: number} = {};
    const bowlerWickets: {[id: string]: number} = {};
    
    processBowlerStats(ball, bowlerBalls, bowlerRuns, bowlerWickets);
    
    expect(bowlerBalls['bowler1']).toBe(1);
    expect(bowlerRuns['bowler1']).toBe(1);
    expect(bowlerWickets['bowler1']).toBe(1);
  });
  
  it('should handle missing bowler ID', () => {
    const ball: Ball = {
      BowlerId: undefined,
      BowlerTeamId: 'team2',
      Score: '4',
      IsWicket: 'False',
      OverNumber: '1',
      BallNumber: '4',
      BatsmanId: 'batter1',
      BatsmanTeamId: 'team1',
      Result: 'boundary',
      Extras: '',
      OverId: '1'
    };
    
    const bowlerBalls: {[id: string]: number} = {};
    const bowlerRuns: {[id: string]: number} = {};
    const bowlerWickets: {[id: string]: number} = {};
    
    processBowlerStats(ball, bowlerBalls, bowlerRuns, bowlerWickets);
    
    expect(Object.keys(bowlerBalls).length).toBe(0);
    expect(Object.keys(bowlerRuns).length).toBe(0);
    expect(Object.keys(bowlerWickets).length).toBe(0);
  });
});
