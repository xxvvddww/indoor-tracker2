
import axios from 'axios';
import { Fixture, Player, MatchDetails } from '../types/cricket';

// Config with base URL and parameters
const API_BASE_URL = "https://seamer.spawtz.com/External/Fixtures/Feed.aspx";
const CURRENT_SEASON_ID = "90"; // Set as a variable for easy changing

// Helper function to parse XML
const parseXml = (xmlString: string) => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, "text/xml");
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
  const items: Element[] = Array.from(xmlDoc.getElementsByTagName(rootTag === 'Item' ? 'Item' : rootTag));
  
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
export const fetchFixtures = async (leagueId: string = "", seasonId: string = CURRENT_SEASON_ID): Promise<Fixture[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, {
      params: {
        Type: "fixtures",
        LeagueId: leagueId,
        SeasonId: seasonId
      },
      responseType: 'text'
    });
    
    const parsed = processXmlResponse(response.data, 'Fixture');
    return parsed && parsed.Fixture ? parsed.Fixture as Fixture[] : [];
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return [];
  }
};

export const fetchPlayerStats = async (leagueId: string = "", seasonId: string = CURRENT_SEASON_ID): Promise<Player[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, {
      params: {
        Type: "statistics",
        LeagueId: leagueId,
        SeasonId: seasonId
      },
      responseType: 'text'
    });
    
    const parsed = processXmlResponse(response.data, 'Item');
    return parsed as Player[];
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return [];
  }
};

export const fetchMatchDetails = async (fixtureId: string): Promise<MatchDetails | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, {
      params: {
        Type: "Scoresheet",
        FixtureId: fixtureId
      },
      responseType: 'text'
    });
    
    const parsed = processXmlResponse(response.data, 'Statistics');
    return parsed && parsed.Statistics ? parsed.Statistics as MatchDetails : null;
  } catch (error) {
    console.error("Error fetching match details:", error);
    return null;
  }
};

export const getCurrentSeasonId = () => CURRENT_SEASON_ID;
export const setCurrentSeasonId = (newId: string) => {
  // This is a simple implementation. In a real app, you might want to use context/redux
  (window as any).CURRENT_SEASON_ID = newId;
  return newId;
};
