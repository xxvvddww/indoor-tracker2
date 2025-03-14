
import { DisplayableMatchInfo } from "../../components/match/types";
import { MatchDetails } from "../../types/cricket";
import { formatDate } from "../dateFormatters";

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
  if (data.Configuration) {
    const config = data.Configuration as any;
    
    if (config.PlayingAreaName) {
      displayData.venue = config.PlayingAreaName;
      console.log("Venue extracted from PlayingAreaName:", displayData.venue);
      return;
    }
    
    // Try alternative Configuration fields
    if (config.GroundName) {
      displayData.venue = config.GroundName;
      console.log("Venue extracted from GroundName:", displayData.venue);
      return;
    }
    
    if (config.Ground) {
      displayData.venue = config.Ground;
      console.log("Venue extracted from Ground:", displayData.venue);
      return;
    }
  }
  
  // Try Skins data as fallback
  if (data.Skins && data.Skins.Skin) {
    const skins = Array.isArray(data.Skins.Skin) ? 
      data.Skins.Skin : [data.Skins.Skin];
    
    if (skins.length > 0 && skins[0].Ground) {
      displayData.venue = skins[0].Ground;
      console.log("Venue extracted from Skins:", displayData.venue);
    }
  }
};

// Extract date information from match data
export const extractDateInfo = (data: MatchDetails, displayData: DisplayableMatchInfo): void => {
  if (data.Configuration) {
    const config = data.Configuration as any;
    
    try {
      // Try each possible date field
      const dateFields = [
        'Team1InningsStartTime', 
        'StartTime', 
        'Date', 
        'MatchDate',
        'CreatedTime'
      ];
      
      for (const field of dateFields) {
        if (config[field] && typeof config[field] === 'string') {
          displayData.date = formatDate(config[field]);
          console.log(`Date extracted from ${field}:`, displayData.date);
          
          // Also set match time if it's available
          if (field.includes('Time') && config[field].includes(':')) {
            const timePart = config[field].split(' ')[1];
            if (timePart) {
              displayData.time = timePart;
              console.log("Time extracted:", displayData.time);
            }
          }
          return;
        }
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  }
  
  // Try Skins data as fallback
  if (data.Skins && data.Skins.Skin) {
    const skins = Array.isArray(data.Skins.Skin) ? 
      data.Skins.Skin : [data.Skins.Skin];
    
    if (skins.length > 0 && skins[0].Date) {
      try {
        displayData.date = formatDate(skins[0].Date);
        console.log("Date extracted from Skins:", displayData.date);
      } catch (error) {
        console.error("Error parsing date from Skins:", error);
      }
    }
  }
};

// Extract match type and additional info
export const extractMatchTypeInfo = (data: MatchDetails, displayData: DisplayableMatchInfo): void => {
  if (data.Configuration) {
    const config = data.Configuration as any;
    
    // Extract match format/type
    if (config.MatchType) {
      displayData.matchType = config.MatchType;
      console.log("Match type extracted:", displayData.matchType);
    } else if (config.Format) {
      displayData.matchType = config.Format;
      console.log("Match format extracted:", displayData.matchType);
    }
    
    // Extract competition/tournament name
    if (config.CompetitionName) {
      displayData.tournament = config.CompetitionName;
      console.log("Tournament name extracted:", displayData.tournament);
    } else if (config.TournamentName) {
      displayData.tournament = config.TournamentName;
      console.log("Tournament name extracted:", displayData.tournament);
    }
    
    // Extract umpires
    if (config.Umpire1) {
      displayData.umpires = [config.Umpire1];
      if (config.Umpire2) {
        displayData.umpires.push(config.Umpire2);
      }
      console.log("Umpires extracted:", displayData.umpires);
    }
  }
};
