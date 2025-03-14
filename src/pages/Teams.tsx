
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTeams, DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID } from '../services/cricketApi';
import MainLayout from "../components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from 'lucide-react';

const Teams = () => {
  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['teams', DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID],
    queryFn: () => fetchTeams(DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID),
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        
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
              <CardDescription>Failed to load teams data</CardDescription>
            </CardHeader>
            <CardContent>
              <p>There was an error loading the teams. Please try again later.</p>
            </CardContent>
          </Card>
        )}
        
        {!isLoading && !error && teams && teams.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Teams Found</CardTitle>
              <CardDescription>There are no teams available for the current season</CardDescription>
            </CardHeader>
          </Card>
        )}
        
        {!isLoading && !error && teams && teams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>All Teams</span>
              </CardTitle>
              <CardDescription>
                All registered teams for the current season
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Division</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.Id}>
                      <TableCell className="font-medium">{team.Name}</TableCell>
                      <TableCell>{team.DivisionName || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Teams;
