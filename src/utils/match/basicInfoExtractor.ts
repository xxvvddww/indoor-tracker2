
import { DisplayableMatchInfo } from '../../components/match/types';
import { MatchDetails } from '../../types/cricket';
import { extractMatchTitle, extractVenueInfo, extractDateInfo, extractManOfMatch } from './matchInfoExtractor';
import { extractMatchTypeInfo } from './displayDataUtils';

/**
 * Extract basic match information (title, venue, date, etc.)
 */
export const extractBasicInfo = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  // Extract title
  extractMatchTitle(matchData, displayInfo);
  
  // Extract venue
  extractVenueInfo(matchData, displayInfo);
  
  // Extract date
  extractDateInfo(matchData, displayInfo);
  
  // Extract match type info
  extractMatchTypeInfo(matchData, displayInfo);
  
  // Extract Man of the Match
  extractManOfMatch(matchData, displayInfo);
  
  console.log("Basic info extraction complete:", {
    title: displayInfo.title,
    venue: displayInfo.venue,
    date: displayInfo.date,
    matchType: displayInfo.matchType,
    tournament: displayInfo.tournament,
    manOfMatch: displayInfo.manOfMatch
  });
};
