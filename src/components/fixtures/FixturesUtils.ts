
import { Fixture } from '../../types/cricket';

export const filterBySearchTerm = (fixture: Fixture, searchTerm: string) => {
  if (!searchTerm) return true;
  
  const homeTeam = fixture.HomeTeam || "";
  const awayTeam = fixture.AwayTeam || "";
  const divisionName = fixture.DivisionName || "";
  const venue = fixture.Venue || "";
  
  return homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
    awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
    divisionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.toLowerCase().includes(searchTerm.toLowerCase());
};

export const sortDivisions = (divisionNames: string[]): string[] => {
  return divisionNames.sort((a, b) => {
    if (a === "No Division") return 1;
    if (b === "No Division") return -1;
    
    const aDivMatch = a.match(/Division (\d+)/i);
    const bDivMatch = b.match(/Division (\d+)/i);
    
    if (aDivMatch && bDivMatch) {
      return parseInt(aDivMatch[1], 10) - parseInt(bDivMatch[1], 10);
    }
    
    if (aDivMatch) return -1;
    
    if (bDivMatch) return 1;
    
    return a.localeCompare(b);
  });
};

export const getFixturesByDivision = (dateFixtures: Fixture[]) => {
  const divisionMap = dateFixtures.reduce((acc, fixture) => {
    const divisionName = fixture.DivisionName || 'No Division';
    if (!acc[divisionName]) {
      acc[divisionName] = [];
    }
    acc[divisionName].push(fixture);
    return acc;
  }, {} as Record<string, Fixture[]>);
  
  return divisionMap;
};
