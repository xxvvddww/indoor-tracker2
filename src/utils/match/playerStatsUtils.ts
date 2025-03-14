
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails } from "../../types/cricket";
import { extractPlayerStatsFromMatch } from './playerStats/extractorService';

// Extract player statistics from match data
export const extractPlayerStats = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  // Delegate to the specialized extractor service
  extractPlayerStatsFromMatch(matchData, displayInfo);
};
