
import { DisplayableMatchInfo } from '../../components/match/types';
import { MatchDetails } from '../../types/cricket';
import { formatDate } from '../dateFormatters';

// Extract basic match information (title, venue, date)
export const extractBasicInfo = (matchData: MatchDetails, displayInfo: DisplayableMatchInfo): void => {
  // Set title if not already set
  if (!displayInfo.title || displayInfo.title === "Match Information") {
    // Try to get title from match name or create from team names
    if (matchData.Teams?.Team) {
      const teams = Array.isArray(matchData.Teams.Team) ? 
        matchData.Teams.Team : [matchData.Teams.Team];
      
      if (teams.length >= 2) {
        displayInfo.title = `${teams[0].Name} vs ${teams[1].Name}`;
      }
    }
  }
  
  // Try to get venue from Configuration
  if (!displayInfo.venue && matchData.Configuration) {
    if ((matchData.Configuration as any)?.PlayingAreaName) {
      displayInfo.venue = (matchData.Configuration as any).PlayingAreaName;
    }
  }
  
  // Try to get and format date
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
