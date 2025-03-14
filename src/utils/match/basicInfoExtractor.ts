
import { DisplayableMatchInfo } from '../../components/match/types';
import { MatchDetails } from '../../types/cricket';
import { extractMatchTitle, extractVenueInfo, extractDateInfo } from './matchInfoExtractor';

/**
 * Extract basic match information (title, venue, date)
 */
export const extractBasicInfo = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  // Extract title
  extractMatchTitle(matchData, displayInfo);
  
  // Extract venue
  extractVenueInfo(matchData, displayInfo);
  
  // Extract date
  extractDateInfo(matchData, displayInfo);
};
