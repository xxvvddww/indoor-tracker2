import { useMemo, useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTeams, fetchFixtures, fetchPlayerStats, DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID } from '../services/cricketApi';
import { Team, Fixture, Player } from '../types/cricket';

export function useTeamData() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn] = useState('Win%');
  const [sortDirection] = useState<'asc' | 'desc'>('desc');
  const [openDivisions, setOpenDivisions] = useState<Record<string, boolean>>({});

  const { data: teams, isLoading: teamsLoading, error: teamsError } = useQuery({
    queryKey: ['teams', DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID],
    queryFn: () => fetchTeams(DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID),
  });

  const { data: fixtures, isLoading: fixturesLoading, error: fixturesError } = useQuery({
    queryKey: ['fixtures', DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID],
    queryFn: () => fetchFixtures(DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID),
  });

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['playerStats', DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID],
    queryFn: () => fetchPlayerStats(DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID),
  });

  const teamStats = useMemo(() => {
    if (!teams || !fixtures || teams.length === 0) return [];

    return teams.map(team => {
      try {
        const teamFixtures = fixtures.filter(
          fixture => fixture.HomeTeamId === team.Id || fixture.AwayTeamId === team.Id
        );

        const totalMatches = teamFixtures.length;
        const completedMatches = teamFixtures.filter(fixture => 
          fixture.CompletionStatus === 'Completed'
        ).length;

        let wins = 0;
        let losses = 0;
        let draws = 0;
        let skinsWon = 0;

        const completedFixtures = teamFixtures
          .filter(fixture => fixture.CompletionStatus === 'Completed')
          .sort((a, b) => {
            const dateA = new Date(a.Date || '');
            const dateB = new Date(b.Date || '');
            return dateB.getTime() - dateA.getTime();
          });

        completedFixtures.forEach(fixture => {
          const isHomeTeam = fixture.HomeTeamId === team.Id;
          const homeScore = parseInt(fixture.HomeTeamScore || '0');
          const awayScore = parseInt(fixture.AwayTeamScore || '0');

          if (homeScore === awayScore) {
            draws++;
          } else if ((isHomeTeam && homeScore > awayScore) || (!isHomeTeam && awayScore > homeScore)) {
            wins++;
            skinsWon++;
          } else {
            losses++;
          }
        });

        const winPercentage = completedMatches > 0 
          ? ((wins / completedMatches) * 100).toFixed(1) 
          : '0.0';

        const teamPlayers = players ? players.filter(
          player => player.TeamName === team.Name
        ).length : 0;

        return {
          ...team,
          totalMatches,
          completedMatches,
          wins,
          losses,
          draws,
          winPercentage,
          skinsWon,
          playerCount: teamPlayers
        };
      } catch (error) {
        console.error(`Error calculating stats for team ${team.Name}:`, error);
        return {
          ...team,
          totalMatches: 0,
          completedMatches: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winPercentage: '0.0',
          skinsWon: 0,
          playerCount: 0
        };
      }
    });
  }, [teams, fixtures, players]);

  const filteredTeams = useMemo(() => {
    if (!teamStats || teamStats.length === 0) return [];
    
    return teamStats.filter(team => 
      team.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.DivisionName && team.DivisionName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [teamStats, searchQuery]);

  const sortedTeams = useMemo(() => {
    if (!filteredTeams || filteredTeams.length === 0) return [];

    return [...filteredTeams].sort((a, b) => {
      let comparison = 0;
      
      const aWinPct = parseFloat(a.winPercentage || '0');
      const bWinPct = parseFloat(b.winPercentage || '0');
      comparison = bWinPct - aWinPct; // Default descending order
      
      return comparison;
    });
  }, [filteredTeams]);

  const teamsByDivision = useMemo(() => {
    if (!sortedTeams.length) return {};
    
    const divisions: Record<string, typeof sortedTeams> = {};
    
    sortedTeams.forEach(team => {
      const divisionName = team.DivisionName || 'No Division';
      if (!divisions[divisionName]) {
        divisions[divisionName] = [];
      }
      divisions[divisionName].push(team);
    });
    
    Object.keys(divisions).forEach(division => {
      divisions[division].sort((a, b) => {
        const aWinPct = parseFloat(a.winPercentage || '0');
        const bWinPct = parseFloat(b.winPercentage || '0');
        return bWinPct - aWinPct;
      });
    });
    
    return divisions;
  }, [sortedTeams]);

  const sortedDivisions = useMemo(() => {
    const divisionOrder = ["Div 1", "Div 2", "Div 3", "No Division"];
    
    return Object.entries(teamsByDivision).sort((a, b) => {
      const indexA = divisionOrder.indexOf(a[0]);
      const indexB = divisionOrder.indexOf(b[0]);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return a[0].localeCompare(b[0]);
    });
  }, [teamsByDivision]);

  useEffect(() => {
    if (Object.keys(teamsByDivision).length > 0) {
      if (Object.keys(openDivisions).length === 0) {
        const initialOpenState: Record<string, boolean> = {};
        Object.keys(teamsByDivision).forEach(division => {
          initialOpenState[division] = true;
        });
        setOpenDivisions(initialOpenState);
      }
    }
  }, [teamsByDivision]);

  const toggleDivision = useCallback((division: string) => {
    setOpenDivisions(prev => ({
      ...prev,
      [division]: !prev[division]
    }));
  }, []);

  const isLoading = teamsLoading || fixturesLoading || playersLoading;

  const mockTeams = [
    { Id: "1", Name: "Marlboro Men", DivisionName: "Div 2", totalMatches: 10, completedMatches: 8, wins: 5, losses: 2, draws: 1, winPercentage: "62.5", playerCount: 12, skinsWon: 15 },
    { Id: "2", Name: "Tri-Hards", DivisionName: "Div 2", totalMatches: 10, completedMatches: 8, wins: 6, losses: 1, draws: 1, winPercentage: "75.0", playerCount: 14, skinsWon: 18 },
    { Id: "3", Name: "Thunder Spirits", DivisionName: "Div 1", totalMatches: 10, completedMatches: 8, wins: 4, losses: 3, draws: 1, winPercentage: "50.0", playerCount: 11, skinsWon: 12 },
    { Id: "4", Name: "Cricket Masters", DivisionName: "Div 1", totalMatches: 10, completedMatches: 8, wins: 7, losses: 1, draws: 0, winPercentage: "87.5", playerCount: 15, skinsWon: 21 },
  ];

  mockTeams.sort((a, b) => parseFloat(b.winPercentage) - parseFloat(a.winPercentage));

  const useFixturesForTeams = teamsError && !fixturesLoading && fixtures && fixtures.length > 0;

  const displayTeams = useFixturesForTeams 
    ? teamStats
    : (teamsError ? mockTeams : sortedTeams);
    
  const totalTeams = useFixturesForTeams 
    ? teamStats.length 
    : (teamsError ? mockTeams.length : (teams?.length || 0));
    
  const uniqueDivisions = useFixturesForTeams
    ? new Set(teamStats.map(t => t.DivisionName).filter(Boolean)).size
    : (teamsError 
        ? new Set(mockTeams.map(t => t.DivisionName).filter(Boolean)).size 
        : (teams?.length ? new Set(teams.map(t => t.DivisionName).filter(Boolean)).size : 0));

  return {
    isLoading,
    teamsError,
    fixturesError,
    searchQuery,
    setSearchQuery,
    sortColumn,
    sortDirection,
    openDivisions,
    toggleDivision,
    teamStats,
    sortedTeams,
    teamsByDivision,
    sortedDivisions,
    displayTeams,
    totalTeams,
    uniqueDivisions
  };
}
