
import { DisplayableMatchInfo } from '../../../../components/match/types';
import { MatchDetails } from '../../../../types/cricket';
import { extractPlayerStatsFromMatch } from '../extractorService';

// Mock the imported functions
jest.mock('../summaryExtractor', () => ({
  extractFromMatchSummary: jest.fn(),
}));

jest.mock('../bowlerBatsmanExtractor', () => ({
  extractFromBatsmenBowlers: jest.fn(),
}));

jest.mock('../ballDataExtractor', () => ({
  extractFromBallData: jest.fn(),
}));

jest.mock('../teamStatsInitializer', () => ({
  ensureTeamStats: jest.fn(),
}));

describe('extractPlayerStatsFromMatch', () => {
  // Add your tests here when needed
  it('should log an error if no teams data is available', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const matchData = {} as MatchDetails;
    const displayInfo = { title: 'Test Match' } as DisplayableMatchInfo;
    
    extractPlayerStatsFromMatch(matchData, displayInfo);
    
    expect(consoleSpy).toHaveBeenCalledWith('No teams data available, cannot extract player stats');
  });
});
