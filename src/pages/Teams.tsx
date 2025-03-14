import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTeams, fetchFixtures, DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID } from '../services/cricketApi';
import MainLayout from "../components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, Search, TrendingUp, Award, Calendar, User, Shield, ChevronUp, ChevronDown } from 'lucide-react';
import { Team, Fixture } from '../types/cricket';
import LoadingSpinner from '../components/ui/loading-spinner';

const Teams = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('Name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch teams data
  const { data: teams, isLoading: teamsLoading, error: teamsError } = useQuery({
    queryKey: ['teams', DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID],
    queryFn: () => fetchTeams(DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID),
  });

  // Fetch fixtures data to calculate team statistics
  const { data: fixtures, isLoading: fixturesLoading, error: fixturesError } = useQuery({
    queryKey: ['fixtures', DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID],
    queryFn: () => fetchFixtures(DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID),
  });

  // Team statistics calculation
  const teamStats = useMemo(() => {
    if (!teams || !fixtures || teams.length === 0) return [];

    return teams.map(team => {
      try {
        // Filter fixtures for this team
        const teamFixtures = fixtures.filter(
          fixture => fixture.HomeTeamId === team.Id || fixture.AwayTeamId === team.Id
        );

        // Calculate basic stats
        const totalMatches = teamFixtures.length;
        const completedMatches = teamFixtures.filter(fixture => 
          fixture.CompletionStatus === 'Completed'
        ).length;

        // Wins, losses, and draws
        let wins = 0;
        let losses = 0;
        let draws = 0;
        let runsScored = 0;
        let runsConceded = 0;
        let lastFiveResults: string[] = [];

        teamFixtures.forEach(fixture => {
          if (fixture.CompletionStatus === 'Completed') {
            const isHomeTeam = fixture.HomeTeamId === team.Id;
            const homeScore = parseInt(fixture.HomeTeamScore || '0');
            const awayScore = parseInt(fixture.AwayTeamScore || '0');

            // Add runs
            if (isHomeTeam) {
              runsScored += homeScore;
              runsConceded += awayScore;
            } else {
              runsScored += awayScore;
              runsConceded += homeScore;
            }

            // Determine match result
            if (homeScore === awayScore) {
              draws++;
              lastFiveResults.push('D');
            } else if ((isHomeTeam && homeScore > awayScore) || (!isHomeTeam && awayScore > homeScore)) {
              wins++;
              lastFiveResults.push('W');
            } else {
              losses++;
              lastFiveResults.push('L');
            }
          }
        });

        // Get the most recent 5 results (reversed to show newest last)
        lastFiveResults = lastFiveResults.slice(-5).reverse();

        // Calculate win percentage
        const winPercentage = completedMatches > 0 
          ? ((wins / completedMatches) * 100).toFixed(1) 
          : '0.0';

        // Calculate run rate
        const runRate = completedMatches > 0 
          ? (runsScored / completedMatches).toFixed(1) 
          : '0.0';

        // Calculate net run rate safely
        const netRunRate = completedMatches > 0 
          ? ((runsScored - runsConceded) / completedMatches).toFixed(2)
          : '0.00';

        return {
          ...team,
          totalMatches,
          completedMatches,
          wins,
          losses,
          draws,
          winPercentage,
          runsScored,
          runsConceded,
          runRate,
          lastFiveResults,
          netRunRate
        };
      } catch (error) {
        console.error(`Error calculating stats for team ${team.Name}:`, error);
        // Return team with default values if calculation fails
        return {
          ...team,
          totalMatches: 0,
          completedMatches: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winPercentage: '0.0',
          runsScored: 0,
          runsConceded: 0,
          runRate: '0.0',
          lastFiveResults: [],
          netRunRate: '0.00'
        };
      }
    });
  }, [teams, fixtures]);

  // Filtering teams based on search query
  const filteredTeams = useMemo(() => {
    if (!teamStats || teamStats.length === 0) return [];
    
    return teamStats.filter(team => 
      team.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.DivisionName && team.DivisionName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [teamStats, searchQuery]);

  // Sorting teams
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
        case 'Matches':
          comparison = a.totalMatches - b.totalMatches;
          break;
        case 'Wins':
          comparison = a.wins - b.wins;
          break;
        case 'Losses':
          comparison = a.losses - b.losses;
          break;
        case 'Draws':
          comparison = a.draws - b.draws;
          break;
        case 'Win%':
          comparison = parseFloat(a.winPercentage) - parseFloat(b.winPercentage);
          break;
        case 'RunRate':
          comparison = parseFloat(a.runRate) - parseFloat(b.runRate);
          break;
        case 'NetRunRate':
          comparison = parseFloat(a.netRunRate) - parseFloat(b.netRunRate);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredTeams, sortColumn, sortDirection]);

  // Toggle sort direction
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Render sort indicator
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1 inline" /> 
      : <ChevronDown className="h-4 w-4 ml-1 inline" />;
  };

  // Render result badge
  const renderResultBadge = (result: string) => {
    switch (result) {
      case 'W':
        return <Badge variant="default" className="bg-green-500">W</Badge>;
      case 'L':
        return <Badge variant="outline" className="text-red-500 border-red-500">L</Badge>;
      case 'D':
        return <Badge variant="secondary">D</Badge>;
      default:
        return null;
    }
  };

  // Check if data is still loading
  const isLoading = teamsLoading || fixturesLoading;

  // Generate mock data for demonstration when API fails
  const mockTeams = [
    { Id: "1", Name: "Marlboro Men", DivisionName: "Div 2", totalMatches: 10, completedMatches: 8, wins: 5, losses: 2, draws: 1, winPercentage: "62.5", runsScored: 450, runsConceded: 380, runRate: "56.3", netRunRate: "8.75", lastFiveResults: ["W", "W", "L", "W", "D"] },
    { Id: "2", Name: "Tri-Hards", DivisionName: "Div 2", totalMatches: 10, completedMatches: 8, wins: 6, losses: 1, draws: 1, winPercentage: "75.0", runsScored: 520, runsConceded: 410, runRate: "65.0", netRunRate: "13.75", lastFiveResults: ["W", "W", "W", "L", "W"] },
    { Id: "3", Name: "Thunder Spirits", DivisionName: "Div 1", totalMatches: 10, completedMatches: 8, wins: 4, losses: 3, draws: 1, winPercentage: "50.0", runsScored: 480, runsConceded: 470, runRate: "60.0", netRunRate: "1.25", lastFiveResults: ["L", "W", "W", "L", "W"] },
    { Id: "4", Name: "Cricket Masters", DivisionName: "Div 1", totalMatches: 10, completedMatches: 8, wins: 7, losses: 1, draws: 0, winPercentage: "87.5", runsScored: 560, runsConceded: 430, runRate: "70.0", netRunRate: "16.25", lastFiveResults: ["W", "W", "W", "W", "L"] },
  ];

  // Use fixture data directly if teams API fails but fixtures API succeeds
  const useFixturesForTeams = teamsError && !fixturesLoading && fixtures && fixtures.length > 0;

  // Determine which data to display
  const displayTeams = useFixturesForTeams 
    ? teamStats // Use the stats calculated from fixtures
    : (teamsError ? mockTeams : sortedTeams);
    
  // Calculate statistics for display
  const totalTeams = useFixturesForTeams 
    ? teamStats.length 
    : (teamsError ? mockTeams.length : (teams?.length || 0));
    
  const uniqueDivisions = useFixturesForTeams
    ? new Set(teamStats.map(t => t.DivisionName).filter(Boolean)).size
    : (teamsError 
        ? new Set(mockTeams.map(t => t.DivisionName).filter(Boolean)).size 
        : (teams?.length ? new Set(teams.map(t => t.DivisionName).filter(Boolean)).size : 0));
    
  const totalMatches = fixturesError 
    ? mockTeams.reduce((sum, team) => sum + team.totalMatches, 0) / 2 
    : (fixtures?.length || 0);
  
  const avgRunRate = useFixturesForTeams
    ? (teamStats.reduce((sum, team) => sum + parseFloat(team.runRate), 0) / teamStats.length).toFixed(2)
    : (teamsError 
        ? (mockTeams.reduce((sum, team) => sum + parseFloat(team.runRate), 0) / mockTeams.length).toFixed(2) 
        : (teamStats?.length ? (teamStats.reduce((sum, team) => sum + parseFloat(team.runRate), 0) / teamStats.length).toFixed(2) : "0.00"));

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams or divisions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quick Stats Cards */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-10 w-10 text-primary p-2 border rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Teams</p>
                  <h3 className="text-2xl font-bold">
                    {isLoading ? <LoadingSpinner size={4} /> : totalTeams}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-10 w-10 text-primary p-2 border rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">Divisions</p>
                  <h3 className="text-2xl font-bold">
                    {isLoading ? <LoadingSpinner size={4} /> : uniqueDivisions}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-10 w-10 text-primary p-2 border rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Matches</p>
                  <h3 className="text-2xl font-bold">
                    {isLoading ? <LoadingSpinner size={4} /> : totalMatches}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-10 w-10 text-primary p-2 border rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Run Rate</p>
                  <h3 className="text-2xl font-bold">
                    {isLoading ? <LoadingSpinner size={4} /> : avgRunRate}
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
        
        {!isLoading && displayTeams.length === 0 && (
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
        
        {displayTeams && displayTeams.length > 0 && (
          <Card>
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
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer w-[180px]" 
                        onClick={() => handleSort('Name')}
                      >
                        Team {renderSortIcon('Name')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer" 
                        onClick={() => handleSort('Division')}
                      >
                        Division {renderSortIcon('Division')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-center" 
                        onClick={() => handleSort('Matches')}
                      >
                        MP {renderSortIcon('Matches')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-center" 
                        onClick={() => handleSort('Wins')}
                      >
                        W {renderSortIcon('Wins')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-center" 
                        onClick={() => handleSort('Losses')}
                      >
                        L {renderSortIcon('Losses')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-center" 
                        onClick={() => handleSort('Draws')}
                      >
                        D {renderSortIcon('Draws')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-center" 
                        onClick={() => handleSort('Win%')}
                      >
                        Win% {renderSortIcon('Win%')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-center" 
                        onClick={() => handleSort('RunRate')}
                      >
                        RR {renderSortIcon('RunRate')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-center" 
                        onClick={() => handleSort('NetRunRate')}
                      >
                        NRR {renderSortIcon('NetRunRate')}
                      </TableHead>
                      <TableHead className="text-center">
                        Last 5
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayTeams.map((team) => (
                      <TableRow key={team.Id}>
                        <TableCell className="font-medium">{team.Name}</TableCell>
                        <TableCell>{team.DivisionName || '-'}</TableCell>
                        <TableCell className="text-center">{team.completedMatches}</TableCell>
                        <TableCell className="text-center">{team.wins}</TableCell>
                        <TableCell className="text-center">{team.losses}</TableCell>
                        <TableCell className="text-center">{team.draws}</TableCell>
                        <TableCell className="text-center">{team.winPercentage}%</TableCell>
                        <TableCell className="text-center">{team.runRate}</TableCell>
                        <TableCell className="text-center">
                          <span className={parseFloat(team.netRunRate) >= 0 ? "text-green-600" : "text-red-600"}>
                            {team.netRunRate}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            {team.lastFiveResults.map((result, idx) => (
                              <span key={idx}>{renderResultBadge(result)}</span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              MP: Matches Played | W: Wins | L: Losses | D: Draws | RR: Run Rate | NRR: Net Run Rate
            </CardFooter>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Teams;
