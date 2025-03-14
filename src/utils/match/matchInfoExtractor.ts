
import { DisplayableMatchInfo } from '../../components/match/types';
import { MatchDetails } from '../../types/cricket';
import { formatDate } from '../dateFormatters';

/**
 * Extract the match title from teams data
 */
export const extractMatchTitle = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  if (!displayInfo.title || displayInfo.title === "Match Information") {
    if (matchData.Teams?.Team) {
      const teams = Array.isArray(matchData.Teams.Team) ? 
        matchData.Teams.Team : [matchData.Teams.Team];
      
      if (teams.length >= 2) {
        displayInfo.title = `${teams[0].Name} vs ${teams[1].Name}`;
      }
    }
  }
};

/**
 * Extract venue information from configuration
 */
export const extractVenueInfo = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  if (!displayInfo.venue && matchData.Configuration) {
    if ((matchData.Configuration as any)?.PlayingAreaName) {
      displayInfo.venue = (matchData.Configuration as any).PlayingAreaName;
    }
  }
};

/**
 * Extract and format the match date
 */
export const extractDateInfo = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  if (!displayInfo.date && matchData.Configuration) {
    try {
      const startTimeStr = (matchData.Configuration as any)?.Team1InningsStartTime;
      if (startTimeStr && typeof startTimeStr === 'string') {
        displayInfo.date = formatDate(startTimeStr);
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  }
};
