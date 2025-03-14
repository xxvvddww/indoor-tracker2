
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails } from "../../types/cricket";

// Core function to initialize the display data structure
export const initializeDisplayData = (data: MatchDetails | null): DisplayableMatchInfo => {
  if (!data) {
    return { title: "Match Information" };
  }
  
  return { 
    title: "Match Information",
    playerStats: {},
    teams: []
  };
};

// Extract venue information from match data
export const extractVenueInfo = (data: MatchDetails, displayData: DisplayableMatchInfo): void => {
  // Try to get venue from Configuration's PlayingAreaName field
  if (data.Configuration && (data.Configuration as any).PlayingAreaName) {
    displayData.venue = (data.Configuration as any).PlayingAreaName;
  }
};

// Extract date information from match data
export const extractDateInfo = (data: MatchDetails, displayData: DisplayableMatchInfo): void => {
  if (data.Configuration) {
    try {
      const startTimeStr = (data.Configuration as any).Team1InningsStartTime;
      if (startTimeStr && typeof startTimeStr === 'string') {
        const dateString = startTimeStr.split(' ')[0];
        displayData.date = dateString;
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  }
};
