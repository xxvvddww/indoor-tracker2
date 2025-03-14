
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStandings, DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID } from '../services/cricketApi';
import MainLayout from "../components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Standings = () => {
  const { data: standings, isLoading, error } = useQuery({
    queryKey: ['standings', DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID],
    queryFn: () => fetchStandings(DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID),
  });

  // Group standings by division
  const divisionStandings = React.useMemo(() => {
    if (!standings) return {};
    
    return standings.reduce((acc, team) => {
      const divisionName = team.DivisionName || 'Unknown Division';
      if (!acc[divisionName]) {
        acc[divisionName] = [];
      }
      acc[divisionName].push(team);
      return acc;
    }, {} as Record<string, typeof standings>);
  }, [standings]);

  // Get unique division names
  const divisions = React.useMemo(() => {
    return Object.keys(divisionStandings);
  }, [divisionStandings]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Team Standings</h1>
        
        {isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>Failed to load standings data</CardDescription>
            </CardHeader>
            <CardContent>
              <p>There was an error loading the standings. Please try again later.</p>
            </CardContent>
          </Card>
        )}
        
        {!isLoading && !error && (!standings || standings.length === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>No Standings Found</CardTitle>
              <CardDescription>There are no standings available for the current season</CardDescription>
            </CardHeader>
          </Card>
        )}
        
        {!isLoading && !error && standings && standings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <span>League Standings</span>
              </CardTitle>
              <CardDescription>
                Current league standings for all divisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {divisions.length > 1 ? (
                <Tabs defaultValue={divisions[0]}>
                  <TabsList className="mb-4">
                    {divisions.map((division) => (
                      <TabsTrigger key={division} value={division}>
                        {division}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {divisions.map((division) => (
                    <TabsContent key={division} value={division}>
                      <StandingsTable teams={divisionStandings[division]} />
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <StandingsTable teams={standings} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

// Helper component to display standings table
const StandingsTable = ({ teams }: { teams: any[] }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pos</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-center">P</TableHead>
          <TableHead className="text-center">W</TableHead>
          <TableHead className="text-center">L</TableHead>
          <TableHead className="text-center">D</TableHead>
          <TableHead className="text-center">Points</TableHead>
          <TableHead className="text-center">RF</TableHead>
          <TableHead className="text-center">RA</TableHead>
          <TableHead className="text-center">QR</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team, index) => (
          <TableRow key={team.Id}>
            <TableCell>{team.Order || index + 1}</TableCell>
            <TableCell className="font-medium">{team.Name}</TableCell>
            <TableCell className="text-center">{team.Played || '0'}</TableCell>
            <TableCell className="text-center">{team.Won || '0'}</TableCell>
            <TableCell className="text-center">{team.Lost || '0'}</TableCell>
            <TableCell className="text-center">{team.Drawn || '0'}</TableCell>
            <TableCell className="font-bold text-center">{team.Points || '0'}</TableCell>
            <TableCell className="text-center">{team.RunsFor || '0'}</TableCell>
            <TableCell className="text-center">{team.RunsAgainst || '0'}</TableCell>
            <TableCell className="text-center">{team.QuotientRatio || '0'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default Standings;
