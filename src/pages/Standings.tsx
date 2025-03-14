
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStandings, DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID } from '../services/cricketApi';
import MainLayout from "../components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

const Standings = () => {
  const { data: standings, isLoading, error } = useQuery({
    queryKey: ['standings', DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID],
    queryFn: () => fetchStandings(DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID),
  });
  const isMobile = useIsMobile();

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

  const compactMode = isMobile;

  return (
    <MainLayout>
      <div className={`space-y-${compactMode ? '2' : '6'} mobile-container`}>
        <h1 className={`${compactMode ? 'text-xl' : 'text-3xl'} font-bold tracking-tight`}>Team Standings</h1>
        
        {isLoading && (
          <Card className={compactMode ? "super-compact-card" : ""}>
            <CardContent className={compactMode ? "p-2" : "pt-6"}>
              <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {error && (
          <Card className={`border-destructive ${compactMode ? "super-compact-card" : ""}`}>
            <CardHeader className={compactMode ? "p-2" : ""}>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>Failed to load standings data</CardDescription>
            </CardHeader>
            <CardContent className={compactMode ? "p-2 pt-0" : ""}>
              <p className={compactMode ? "text-xxs" : ""}>There was an error loading the standings. Please try again later.</p>
            </CardContent>
          </Card>
        )}
        
        {!isLoading && !error && (!standings || standings.length === 0) && (
          <Card className={compactMode ? "super-compact-card" : ""}>
            <CardHeader className={compactMode ? "p-2" : ""}>
              <CardTitle className={compactMode ? "text-sm" : ""}>No Standings Found</CardTitle>
              <CardDescription className={compactMode ? "text-xxs" : ""}>There are no standings available for the current season</CardDescription>
            </CardHeader>
          </Card>
        )}
        
        {!isLoading && !error && standings && standings.length > 0 && (
          <Card className={compactMode ? "p-0 border-0 shadow-none" : ""}>
            {!compactMode && (
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span>League Standings</span>
                </CardTitle>
                <CardDescription>
                  Current league standings for all divisions
                </CardDescription>
              </CardHeader>
            )}
            <CardContent className={compactMode ? "p-0" : ""}>
              {divisions.length > 1 ? (
                <Tabs defaultValue={divisions[0]}>
                  <TabsList className={`mb-${compactMode ? '1' : '4'} ${compactMode ? 'text-xxs' : ''}`}>
                    {divisions.map((division) => (
                      <TabsTrigger key={division} value={division} className={compactMode ? "h-7 px-2" : ""}>
                        {division}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {divisions.map((division) => (
                    <TabsContent key={division} value={division}>
                      <StandingsTable teams={divisionStandings[division]} isMobile={isMobile} />
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <StandingsTable teams={standings} isMobile={isMobile} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

// Helper component to display standings table
const StandingsTable = ({ teams, isMobile }: { teams: any[], isMobile: boolean }) => {
  const compactMode = isMobile;
  
  return (
    <div className={compactMode ? "super-compact-table overflow-x-auto -mx-2" : ""}>
      <Table className={compactMode ? "text-xxs" : ""}>
        <TableHeader>
          <TableRow className={compactMode ? "h-8" : ""}>
            <TableHead className={compactMode ? "py-1 px-1" : ""}>Pos</TableHead>
            <TableHead className={compactMode ? "py-1 px-1" : ""}>Team</TableHead>
            <TableHead className={`text-center ${compactMode ? "py-1 px-1" : ""}`}>P</TableHead>
            <TableHead className={`text-center ${compactMode ? "py-1 px-1" : ""}`}>W</TableHead>
            <TableHead className={`text-center ${compactMode ? "py-1 px-1" : ""}`}>L</TableHead>
            {!compactMode && <TableHead className="text-center">D</TableHead>}
            <TableHead className={`text-center ${compactMode ? "py-1 px-1" : ""}`}>Pts</TableHead>
            {!compactMode && (
              <>
                <TableHead className="text-center">RF</TableHead>
                <TableHead className="text-center">RA</TableHead>
                <TableHead className="text-center">QR</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => (
            <TableRow key={team.Id} className={compactMode ? "h-8" : ""}>
              <TableCell className={compactMode ? "py-1 px-1" : ""}>{team.Order || index + 1}</TableCell>
              <TableCell className={`font-medium ${compactMode ? "py-1 px-1 truncate max-w-[100px]" : ""}`}>{team.Name}</TableCell>
              <TableCell className={`text-center ${compactMode ? "py-1 px-1" : ""}`}>{team.Played || '0'}</TableCell>
              <TableCell className={`text-center ${compactMode ? "py-1 px-1" : ""}`}>{team.Won || '0'}</TableCell>
              <TableCell className={`text-center ${compactMode ? "py-1 px-1" : ""}`}>{team.Lost || '0'}</TableCell>
              {!compactMode && <TableCell className="text-center">{team.Drawn || '0'}</TableCell>}
              <TableCell className={`font-bold text-center ${compactMode ? "py-1 px-1" : ""}`}>{team.Points || '0'}</TableCell>
              {!compactMode && (
                <>
                  <TableCell className="text-center">{team.RunsFor || '0'}</TableCell>
                  <TableCell className="text-center">{team.RunsAgainst || '0'}</TableCell>
                  <TableCell className="text-center">{team.QuotientRatio || '0'}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Standings;
