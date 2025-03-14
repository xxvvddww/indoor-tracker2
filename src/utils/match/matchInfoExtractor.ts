
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
    } else if (matchData.Configuration) {
      const config = matchData.Configuration as any;
      if (config.Team1Name && config.Team2Name) {
        displayInfo.title = `${config.Team1Name} vs ${config.Team2Name}`;
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

/**
 * Extract the Man of the Match information
 */
export const extractManOfMatch = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  // Check if we already have the information
  if (displayInfo.manOfMatch) {
    return;
  }
  
  // Try to extract from Configuration
  if (matchData.Configuration) {
    const config = matchData.Configuration as any;
    
    const possibleFields = [
      'ManOfTheMatch',
      'PlayerOfTheMatch',
      'MOM',
      'MOTM',
      'BestPlayer'
    ];
    
    for (const field of possibleFields) {
      if (config[field]) {
        displayInfo.manOfMatch = config[field];
        console.log("Man of the match extracted:", displayInfo.manOfMatch);
        return;
      }
    }
  }
  
  // Try to extract from MatchSummary
  if (matchData.MatchSummary?.manOfMatch) {
    displayInfo.manOfMatch = matchData.MatchSummary.manOfMatch;
    console.log("Man of the match from MatchSummary:", displayInfo.manOfMatch);
  }
};
