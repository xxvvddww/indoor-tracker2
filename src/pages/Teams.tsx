import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTeams, fetchFixtures, fetchPlayerStats, DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID } from '../services/cricketApi';
import MainLayout from "../components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Trophy, Shield, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { Team, Fixture, Player } from '../types/cricket';
import LoadingSpinner from '../components/ui/loading-spinner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

const Teams = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('Name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [openDivisions, setOpenDivisions] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();

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
      
      switch (sortColumn) {
        case 'Name':
          comparison = a.Name.localeCompare(b.Name);
          break;
        case 'Division':
          const divA = a.DivisionName || '';
          const divB = b.DivisionName || '';
          comparison = divA.localeCompare(divB);
          break;
        case 'Players':
          comparison = a.playerCount - b.playerCount;
          break;
        case 'Games':
          comparison = a.completedMatches - b.completedMatches;
          break;
        case 'Wins':
          comparison = a.wins - b.wins;
          break;
        case 'Losses':
          comparison = a.losses - b.losses;
          break;
        case 'Win%':
          comparison = parseFloat(a.winPercentage) - parseFloat(b.winPercentage);
          break;
        case 'Skins':
          comparison = a.skinsWon - b.skinsWon;
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredTeams, sortColumn, sortDirection]);

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

  React.useEffect(() => {
    if (Object.keys(teamsByDivision).length > 0) {
      const initialOpenState: Record<string, boolean> = {};
      Object.keys(teamsByDivision).forEach(division => {
        initialOpenState[division] = true;
      });
      setOpenDivisions(initialOpenState);
    }
  }, [teamsByDivision]);

  const toggleDivision = (division: string) => {
    setOpenDivisions(prev => ({
      ...prev,
      [division]: !prev[division]
    }));
  };

  const handleSort = (column: string) => {
    const currentOpenState = { ...openDivisions };
    
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    
    setOpenDivisions(currentOpenState);
  };

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1 inline" /> 
      : <ChevronDown className="h-4 w-4 ml-1 inline" />;
  };

  const renderResultBadge = (result: string) => {
    const size = isMobile ? "w-4 h-4" : "w-6 h-6";
    const fontSize = isMobile ? "text-[9px]" : "text-xs";
    
    switch (result) {
      case 'W':
        return <div className={`${size} rounded-full bg-green-500 flex items-center justify-center text-white font-semibold ${fontSize}`}>W</div>;
      case 'L':
        return <div className={`${size} rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 font-semibold ${fontSize}`}>L</div>;
      case 'D':
        return <div className={`${size} rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold ${fontSize}`}>D</div>;
      default:
        return <div className={`${size} rounded-full border border-gray-200 flex items-center justify-center text-gray-400 ${fontSize}`}>-</div>;
    }
  };

  const isLoading = teamsLoading || fixturesLoading || playersLoading;

  const mockTeams = [
    { Id: "1", Name: "Marlboro Men", DivisionName: "Div 2", totalMatches: 10, completedMatches: 8, wins: 5, losses: 2, draws: 1, winPercentage: "62.5", playerCount: 12, skinsWon: 15, lastFiveResults: ["W", "W", "L", "W", "D"] },
    { Id: "2", Name: "Tri-Hards", DivisionName: "Div 2", totalMatches: 10, completedMatches: 8, wins: 6, losses: 1, draws: 1, winPercentage: "75.0", playerCount: 14, skinsWon: 18, lastFiveResults: ["W", "W", "W", "L", "W"] },
    { Id: "3", Name: "Thunder Spirits", DivisionName: "Div 1", totalMatches: 10, completedMatches: 8, wins: 4, losses: 3, draws: 1, winPercentage: "50.0", playerCount: 11, skinsWon: 12, lastFiveResults: ["L", "W", "W", "L", "W"] },
    { Id: "4", Name: "Cricket Masters", DivisionName: "Div 1", totalMatches: 10, completedMatches: 8, wins: 7, losses: 1, draws: 0, winPercentage: "87.5", playerCount: 15, skinsWon: 21, lastFiveResults: ["W", "W", "W", "W", "L"] },
  ];

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

  const getCompactLayout = () => {
    return isMobile;
  };

  const compactMode = getCompactLayout();

  return (
    <MainLayout>
      <div className={`space-y-${compactMode ? '2' : '6'}`}>
        <div className="flex justify-between items-center">
          <h1 className={`${compactMode ? 'text-xl' : 'text-3xl'} font-bold tracking-tight`}>Teams</h1>
          
          <div className={`relative ${compactMode ? 'w-36' : 'w-72'}`}>
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={compactMode ? "Search..." : "Search teams or divisions..."}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className={`grid grid-cols-3 gap-${compactMode ? '1' : '4'}`}>
          <Card className={compactMode ? 'p-0' : ''}>
            <CardContent className={compactMode ? 'p-2 pt-2' : 'pt-6'}>
              <div className="flex items-center space-x-2">
                <Users className={`${compactMode ? 'h-7 w-7' : 'h-10 w-10'} text-primary p-1 border rounded-full`} />
                <div>
                  <p className={`${compactMode ? 'text-xxs' : 'text-sm'} text-muted-foreground`}>Total Teams</p>
                  <h3 className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold`}>
                    {isLoading ? <LoadingSpinner size={compactMode ? 3 : 4} /> : totalTeams}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={compactMode ? 'p-0' : ''}>
            <CardContent className={compactMode ? 'p-2 pt-2' : 'pt-6'}>
              <div className="flex items-center space-x-2">
                <Shield className={`${compactMode ? 'h-7 w-7' : 'h-10 w-10'} text-primary p-1 border rounded-full`} />
                <div>
                  <p className={`${compactMode ? 'text-xxs' : 'text-sm'} text-muted-foreground`}>Divisions</p>
                  <h3 className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold`}>
                    {isLoading ? <LoadingSpinner size={compactMode ? 3 : 4} /> : uniqueDivisions}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={compactMode ? 'p-0' : ''}>
            <CardContent className={compactMode ? 'p-2 pt-2' : 'pt-6'}>
              <div className="flex items-center space-x-2">
                <Trophy className={`${compactMode ? 'h-7 w-7' : 'h-10 w-10'} text-primary p-1 border rounded-full`} />
                <div>
                  <p className={`${compactMode ? 'text-xxs' : 'text-sm'} text-muted-foreground truncate`}>{compactMode ? "100% Wins" : "Teams with 100% Win Rate"}</p>
                  <h3 className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold`}>
                    {isLoading ? <LoadingSpinner size={compactMode ? 3 : 4} /> : displayTeams.filter(t => parseFloat(t.winPercentage) === 100).length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {isLoading && (
          <Card>
            <CardContent className="pt-6 py-12">
              <div className="flex flex-col items-center justify-center p-8 gap-4">
                <LoadingSpinner size={8} />
                <p className="text-muted-foreground">Loading team data...</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {teamsError && !isLoading && !useFixturesForTeams && (
          <Card className="border-yellow-500">
            <CardHeader>
              <CardTitle className="text-yellow-600">API Error</CardTitle>
              <CardDescription>Using sample data for demonstration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">There was an error loading the teams data from the API. We're showing sample data for demonstration purposes.</p>
              <p className="text-sm text-muted-foreground">Error details: {teamsError instanceof Error ? teamsError.message : 'Unknown error'}</p>
            </CardContent>
          </Card>
        )}
        
        {!isLoading && Object.keys(teamsByDivision).length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Teams Found</CardTitle>
              <CardDescription>There are no teams available for the current season</CardDescription>
            </CardHeader>
            <CardContent>
              <p>No team data was returned by the API for the current season. Please check back later or try a different season.</p>
            </CardContent>
          </Card>
        )}
        
        {Object.keys(teamsByDivision).length > 0 && (
          <Card className={compactMode ? 'p-0 border-0 shadow-none' : ''}>
            {!compactMode && (
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Team Rankings</span>
                </CardTitle>
                <CardDescription>
                  {teamsError && !useFixturesForTeams ? 
                    "Sample data for demonstration purposes" : 
                    "Team performance statistics for the current season"}
                </CardDescription>
              </CardHeader>
            )}
            <CardContent className={compactMode ? 'p-0' : ''}>
              <div className={`space-y-${compactMode ? '1' : '6'}`}>
                {sortedDivisions.map(([division, divisionTeams]) => (
                  <Collapsible 
                    key={division}
                    open={openDivisions[division]}
                    onOpenChange={() => toggleDivision(division)}
                    className={`${compactMode ? 'border-0' : 'border'} rounded-lg overflow-hidden`}
                  >
                    <CollapsibleTrigger className={`flex items-center justify-between w-full ${compactMode ? 'p-2' : 'p-4'} bg-muted/30 hover:bg-muted/50 transition-colors`}>
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Shield className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
                        <span>{division}</span>
                        <Badge variant="outline" className={compactMode ? 'text-xxs py-0 px-1' : ''}>{divisionTeams.length} Teams</Badge>
                      </div>
                      {openDivisions[division] ? 
                        <ChevronUp className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'}`} /> : 
                        <ChevronDown className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'}`} />}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="overflow-x-auto">
                        <Table className={compactMode ? 'text-xxs' : ''}>
                          <TableHeader className="sticky top-0 bg-card">
                            <TableRow className={compactMode ? 'h-8' : ''}>
                              <TableHead 
                                className={`cursor-pointer ${compactMode ? 'w-[100px] py-1 px-1' : 'w-[180px]'}`}
                                onClick={() => handleSort('Name')}
                              >
                                Team {renderSortIcon('Name')}
                              </TableHead>
                              <TableHead 
                                className={`cursor-pointer text-center ${compactMode ? 'py-1 px-1' : ''}`}
                                onClick={() => handleSort('Players')}
                              >
                                {compactMode ? 'Pl' : 'Players'} {renderSortIcon('Players')}
                              </TableHead>
                              <TableHead 
                                className={`cursor-pointer text-center ${compactMode ? 'py-1 px-1' : ''}`}
                                onClick={() => handleSort('Games')}
                              >
                                {compactMode ? 'G' : 'Games'} {renderSortIcon('Games')}
                              </TableHead>
                              <TableHead 
                                className={`cursor-pointer text-center ${compactMode ? 'py-1 px-1' : ''}`}
                                onClick={() => handleSort('Wins')}
                              >
                                {compactMode ? 'W' : 'Wins'} {renderSortIcon('Wins')}
                              </TableHead>
                              {!compactMode && (
                                <TableHead 
                                  className="cursor-pointer text-center" 
                                  onClick={() => handleSort('Losses')}
                                >
                                  Losses {renderSortIcon('Losses')}
                                </TableHead>
                              )}
                              <TableHead 
                                className={`cursor-pointer text-center ${compactMode ? 'py-1 px-1' : ''}`}
                                onClick={() => handleSort('Win%')}
                              >
                                {compactMode ? '%' : 'Win%'} {renderSortIcon('Win%')}
                              </TableHead>
                              {!compactMode && (
                                <TableHead 
                                  className="cursor-pointer text-center" 
                                  onClick={() => handleSort('Skins')}
                                >
                                  Skins Won {renderSortIcon('Skins')}
                                </TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {divisionTeams.map((team) => (
                              <TableRow key={team.Id} className={compactMode ? 'h-8' : ''}>
                                <TableCell className={`font-medium truncate ${compactMode ? 'py-1 px-1' : ''}`}>
                                  {team.Name}
                                </TableCell>
                                <TableCell className={`text-center ${compactMode ? 'py-1 px-1' : ''}`}>
                                  {team.playerCount || '-'}
                                </TableCell>
                                <TableCell className={`text-center ${compactMode ? 'py-1 px-1' : ''}`}>
                                  {team.completedMatches}
                                </TableCell>
                                <TableCell className={`text-center ${compactMode ? 'py-1 px-1' : ''}`}>
                                  {team.wins}
                                </TableCell>
                                {!compactMode && (
                                  <TableCell className="text-center">
                                    {team.losses}
                                  </TableCell>
                                )}
                                <TableCell className={`text-center ${compactMode ? 'py-1 px-1' : ''}`}>
                                  {compactMode ? parseFloat(team.winPercentage).toFixed(0) : team.winPercentage}%
                                </TableCell>
                                {!compactMode && (
                                  <TableCell className="text-center">
                                    {team.skinsWon}
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
            {!compactMode && (
              <CardFooter className="text-sm text-muted-foreground">
                Statistics based on completed matches | Win% = Wins ÷ Games × 100
              </CardFooter>
            )}
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Teams;
