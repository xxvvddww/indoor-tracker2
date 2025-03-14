
import axios from 'axios';
import { Fixture, Player, MatchDetails } from '../types/cricket';
import { toast } from 'sonner';

// Config with base URL and parameters
const API_BASE_URL = "https://seamer.spawtz.com/External/Fixtures/Feed.aspx";
export const CURRENT_SEASON_ID = "90"; // Set as a variable for easy changing
export const DEFAULT_LEAGUE_ID = "6"; // Setting a default based on the image

// Helper function to parse XML
const parseXml = (xmlString: string) => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, "text/xml");
};

// Check if XML contains an error message
const checkForApiError = (xmlDoc: Document): string | null => {
  const errorNode = xmlDoc.querySelector('Error');
  if (errorNode && errorNode.getAttribute('message')) {
    return errorNode.getAttribute('message');
  } else if (errorNode && errorNode.textContent) {
    return errorNode.textContent;
  }
  return null;
};

// Convert XML node to object
const xmlNodeToObject = (node: Element): any => {
  const obj: any = {};
  
  // Add attributes
  Array.from(node.attributes).forEach(attr => {
    obj[attr.name] = attr.value;
  });
  
  // Add child elements
  Array.from(node.children).forEach(child => {
    const childName = child.tagName;
    const childValue = xmlNodeToObject(child);
    
    if (obj[childName]) {
      // If property already exists, convert to array
      if (!Array.isArray(obj[childName])) {
        obj[childName] = [obj[childName]];
      }
      obj[childName].push(childValue);
    } else {
      obj[childName] = childValue;
    }
  });
  
  // If the node has no children and no attributes, return its text content
  if (Object.keys(obj).length === 0) {
    return node.textContent;
  }
  
  return obj;
};

// Process XML to objects
const processXmlResponse = (xmlString: string, rootTag: string): any => {
  const xmlDoc = parseXml(xmlString);
  
  // Check for API errors first
  const errorMessage = checkForApiError(xmlDoc);
  if (errorMessage) {
    console.error("API returned an error:", errorMessage);
    toast.error(`API Error: ${errorMessage}`);
    return null;
  }
  
  // For League tag which contains season info
  if (xmlDoc.querySelector('League') && rootTag === 'Fixture') {
    const leagueEl = xmlDoc.querySelector('League');
    if (leagueEl) {
      const seasonName = leagueEl.getAttribute('SeasonName');
      if (seasonName) {
        console.log(`Season: ${seasonName}`);
      }
    }
    
    // Look for fixtures
    const items: Element[] = Array.from(xmlDoc.getElementsByTagName(rootTag));
    console.log(`Found ${items.length} ${rootTag} elements in XML response`);
    
    if (items.length === 0) {
      console.warn(`No ${rootTag} data found in response`);
      return { [rootTag]: [] };
    }
    
    return {
      [rootTag]: items.map(item => xmlNodeToObject(item))
    };
  }
  
  const items: Element[] = Array.from(xmlDoc.getElementsByTagName(rootTag === 'Item' ? 'Item' : rootTag));
  console.log(`Found ${items.length} ${rootTag} elements in XML response`);
  
  if (items.length === 0) {
    console.warn(`No ${rootTag} data found in response`);
    if (rootTag === 'Statistics') {
      return { Statistics: [] };
    }
    if (rootTag === 'Item') {
      return [];
    }
    return { [rootTag]: [] };
  }
  
  if (rootTag === 'Statistics') {
    return {
      Statistics: Array.from(items).map(item => xmlNodeToObject(item))
    };
  }
  
  if (rootTag === 'Item') {
    return Array.from(items).map(item => {
      const obj: any = {};
      Array.from(item.attributes).forEach(attr => {
        obj[attr.name] = attr.value;
      });
      return obj;
    });
  }
  
  return {
    [rootTag]: items.map(item => xmlNodeToObject(item))
  };
};

// API functions
export const fetchFixtures = async (leagueId: string = DEFAULT_LEAGUE_ID, seasonId: string = CURRENT_SEASON_ID): Promise<Fixture[]> => {
  try {
    const url = `${API_BASE_URL}?Type=fixtures&LeagueId=${leagueId}&SeasonId=${seasonId}`;
    console.log(`Fetching fixtures with URL: ${url}`);
    
    const response = await axios.get(API_BASE_URL, {
      params: {
        Type: "fixtures",
        LeagueId: leagueId, 
        SeasonId: seasonId
      },
      responseType: 'text'
    });
    
    console.log('Fixtures API response received. Length:', response.data.length);
    console.log('First 200 chars of response:', response.data.substring(0, 200));
    
    const parsed = processXmlResponse(response.data, 'Fixture');
    console.log('Parsed fixtures count:', parsed && parsed.Fixture ? parsed.Fixture.length : 0);
    
    if (parsed === null) {
      toast.warning("No fixtures available for the selected season");
      return [];
    }
    
    const fixtures = parsed && parsed.Fixture ? parsed.Fixture as Fixture[] : [];
    
    if (fixtures.length === 0) {
      toast.info("No fixtures found for the selected season and league");
    } else {
      toast.success(`Loaded ${fixtures.length} fixtures`);
      
      // Map XML properties to our expected fixture properties
      const mappedFixtures = fixtures.map(fixture => {
        // Map DateTime to Date and StartTime
        let fixtureDate = '';
        let startTime = '';
        
        if (fixture.DateTime) {
          const dateTimeParts = fixture.DateTime.split(' ');
          fixtureDate = dateTimeParts[0] || '';
          startTime = dateTimeParts[1] || '';
        }
        
        // Use venue information from API response
        const venue = fixture.VenueName || fixture.PlayingAreaName || '';
        
        // Calculate completion status and score
        const homeScore = fixture.HomeTeamScore || '0';
        const awayScore = fixture.AwayTeamScore || '0';
        const isCompleted = !!(fixture.HomeTeamScore && fixture.AwayTeamScore);
        const homeTeamWon = parseInt(homeScore) > parseInt(awayScore);
        const awayTeamWon = parseInt(awayScore) > parseInt(homeScore);
        
        return {
          ...fixture,
          Date: fixtureDate || fixture.Date || '',
          StartTime: startTime || fixture.StartTime || '',
          Venue: venue || fixture.Venue || '',
          CompletionStatus: isCompleted ? 'Completed' : 'Scheduled',
          HomeTeamWon: homeTeamWon,
          AwayTeamWon: awayTeamWon,
          ScoreDescription: `${homeScore} - ${awayScore}`
        };
      });
      
      console.log('First fixture after mapping:', mappedFixtures[0]);
      return mappedFixtures;
    }
    
    return fixtures;
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    toast.error("Failed to load fixtures. Please try again later.");
    return [];
  }
};

export const fetchPlayerStats = async (leagueId: string = DEFAULT_LEAGUE_ID, seasonId: string = CURRENT_SEASON_ID): Promise<Player[]> => {
  try {
    console.log(`Fetching player stats with leagueId: ${leagueId}, seasonId: ${seasonId}`);
    const response = await axios.get(`${API_BASE_URL}`, {
      params: {
        Type: "statistics",
        LeagueId: leagueId,
        SeasonId: seasonId
      },
      responseType: 'text'
    });
    
    console.log('Player stats API response received. Length:', response.data.length);
    const parsed = processXmlResponse(response.data, 'Item');
    console.log('Parsed player stats count:', parsed ? parsed.length : 0);
    
    if (parsed === null) {
      toast.warning("No player statistics available for the selected season");
      return [];
    }
    
    const players = parsed as Player[] || [];
    
    if (players.length === 0) {
      toast.info("No player statistics found for the selected season and league");
    } else {
      toast.success(`Loaded statistics for ${players.length} players`);
    }
    
    return players;
  } catch (error) {
    console.error("Error fetching player stats:", error);
    toast.error("Failed to load player statistics. Please try again later.");
    return [];
  }
};

export const fetchMatchDetails = async (fixtureId: string): Promise<MatchDetails | null> => {
  try {
    console.log(`Fetching match details for fixture: ${fixtureId}`);
    const response = await axios.get(`${API_BASE_URL}`, {
      params: {
        Type: "Scoresheet",
        FixtureId: fixtureId
      },
      responseType: 'text'
    });
    
    console.log('Match details API response received. Length:', response.data.length);
    const parsed = processXmlResponse(response.data, 'Statistics');
    console.log('Parsed match details:', parsed);
    
    if (parsed === null) {
      toast.warning("No match details available for this fixture");
      return null;
    }
    
    const matchDetails = parsed && parsed.Statistics ? parsed.Statistics as MatchDetails : null;
    
    if (!matchDetails) {
      toast.info("No statistics found for this match");
    } else {
      toast.success("Match details loaded successfully");
    }
    
    return matchDetails;
  } catch (error) {
    console.error("Error fetching match details:", error);
    toast.error("Failed to load match details. Please try again later.");
    return null;
  }
};

export const getCurrentSeasonId = () => CURRENT_SEASON_ID;
export const setCurrentSeasonId = (newId: string) => {
  // This is a simple implementation. In a real app, you might want to use context/redux
  (window as any).CURRENT_SEASON_ID = newId;
  return newId;
};
