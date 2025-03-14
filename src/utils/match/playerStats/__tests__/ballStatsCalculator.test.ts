
import { DisplayableMatchInfo } from '../../../../components/match/types';
import { Ball, BowlerBatsman } from '../../../../types/cricket';
import { calculateStatsFromBalls } from '../ballStatsCalculator';
import { processBowlerStats } from '../bowlerStatsProcessor';
import { processBatsmanStats } from '../batsmanStatsProcessor';
import { updatePlayerStatsWithCalculatedValues } from '../playerStatsUpdater';

// Mock dependencies
jest.mock('../bowlerStatsProcessor', () => ({
  processBowlerStats: jest.fn(),
}));

jest.mock('../batsmanStatsProcessor', () => ({
  processBatsmanStats: jest.fn(),
}));

jest.mock('../playerStatsUpdater', () => ({
  updatePlayerStatsWithCalculatedValues: jest.fn(),
}));

describe('calculateStatsFromBalls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should process each ball and update player stats', () => {
    // Setup test data
    const balls: Ball[] = [
      {
        BowlerId: 'bowler1',
        BowlerTeamId: 'team1',
        BatsmanId: 'batter1',
        BatsmanTeamId: 'team2',
        Score: '4',
        IsWicket: 'False',
        OverNumber: '1',
        BallNumber: '1',
        Result: '',
        Extras: '',
        OverId: '1'
      },
      {
        BowlerId: 'bowler1',
        BowlerTeamId: 'team1',
        BatsmanId: 'batter1',
        BatsmanTeamId: 'team2',
        Score: '0',
        IsWicket: 'True',
        OverNumber: '1',
        BallNumber: '2',
        Result: '',
        Extras: '',
        OverId: '1'
      }
    ];
    
    const batsmen: BowlerBatsman[] = [
      { Id: 'batter1', Name: 'Batsman 1', TeamId: 'team2', TeamName: 'Team 2' }
    ];
    
    const bowlers: BowlerBatsman[] = [
      { Id: 'bowler1', Name: 'Bowler 1', TeamId: 'team1', TeamName: 'Team 1' }
    ];
    
    const displayInfo: DisplayableMatchInfo = {
      title: 'Test Match',
      playerStats: {
        'team1': {
          name: 'Team 1',
          players: [{ Name: 'Bowler 1' }]
        },
        'team2': {
          name: 'Team 2',
          players: [{ Name: 'Batsman 1' }]
        }
      }
    };
    
    // Call the function
    calculateStatsFromBalls(balls, batsmen, bowlers, displayInfo);
    
    // Verify the calls
    expect(processBowlerStats).toHaveBeenCalledTimes(2);
    expect(processBatsmanStats).toHaveBeenCalledTimes(2);
    expect(updatePlayerStatsWithCalculatedValues).toHaveBeenCalledTimes(2);
  });
});
