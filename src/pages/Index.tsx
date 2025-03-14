
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { fetchFixtures, fetchPlayerStats, getCurrentSeasonId } from "../services/cricketApi";
import { Fixture, Player } from "../types/cricket";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ArrowUpRight, Calendar, Star, Award } from "lucide-react";
import { Link } from "react-router-dom";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const isToday = (dateString: string) => {
  const today = new Date();
  const date = new Date(dateString);
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const isFutureDate = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day
  const date = new Date(dateString);
  return date > today;
};

const Index = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const seasonId = getCurrentSeasonId();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const [fixturesData, playersData] = await Promise.all([
          fetchFixtures("", seasonId),
          fetchPlayerStats("", seasonId)
        ]);
        
        setFixtures(fixturesData);
        setPlayers(playersData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [seasonId]);
  
  // Filter fixtures
  const upcomingFixtures = fixtures
    .filter(fixture => isFutureDate(fixture.Date))
    .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
    .slice(0, 5);
    
  const recentFixtures = fixtures
    .filter(fixture => !isFutureDate(fixture.Date) && fixture.CompletionStatus === "Completed")
    .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
    .slice(0, 5);
  
  // Filter top players by runs  
  const topBatsmen = [...players]
    .sort((a, b) => parseInt(b.RunsScored) - parseInt(a.RunsScored))
    .slice(0, 5);
    
  // Filter top players by wickets
  const topBowlers = [...players]
    .sort((a, b) => parseInt(b.Wickets) - parseInt(a.Wickets))
    .slice(0, 5);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Season ID: {seasonId}</span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner size={8} />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Upcoming Fixtures */}
              <div className="bg-card rounded-lg border shadow-sm">
                <div className="p-4 flex justify-between items-center border-b">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Upcoming Fixtures</span>
                  </h2>
                  <Link to="/fixtures" className="text-sm text-primary flex items-center">
                    View All <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
                <div className="p-2">
                  {upcomingFixtures.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingFixtures.map((fixture) => (
                        <div key={fixture.Id} className="bg-background p-3 rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {isToday(fixture.Date) ? "Today" : formatDate(fixture.Date)} • {fixture.DivisionName}
                              </p>
                              <p className="font-medium mt-1">
                                {fixture.HomeTeam} vs {fixture.AwayTeam}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {fixture.Venue} • {fixture.StartTime}
                              </p>
                            </div>
                            <Link to={`/match/${fixture.Id}`} className="text-primary mt-1">
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No upcoming fixtures found
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Results */}
              <div className="bg-card rounded-lg border shadow-sm">
                <div className="p-4 flex justify-between items-center border-b">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Recent Results</span>
                  </h2>
                  <Link to="/fixtures" className="text-sm text-primary flex items-center">
                    View All <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
                <div className="p-2">
                  {recentFixtures.length > 0 ? (
                    <div className="space-y-2">
                      {recentFixtures.map((fixture) => (
                        <div key={fixture.Id} className="bg-background p-3 rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(fixture.Date)} • {fixture.DivisionName}
                              </p>
                              <p className="font-medium mt-1">
                                {fixture.HomeTeam} vs {fixture.AwayTeam}
                              </p>
                              <p className="text-sm mt-1">
                                {fixture.ScoreDescription}
                              </p>
                            </div>
                            <Link to={`/match/${fixture.Id}`} className="text-primary mt-1">
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      No recent results found
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Player Stats */}
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>Player Statistics</span>
                </h2>
              </div>
              <Tabs defaultValue="batting" className="p-4">
                <TabsList className="mb-4">
                  <TabsTrigger value="batting">Top Batsmen</TabsTrigger>
                  <TabsTrigger value="bowling">Top Bowlers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="batting">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead className="text-right">Runs</TableHead>
                        <TableHead className="text-right">Games</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topBatsmen.map((player) => (
                        <TableRow key={player.Id}>
                          <TableCell className="font-medium">{player.UserName}</TableCell>
                          <TableCell>{player.TeamName}</TableCell>
                          <TableCell>{player.DivisionName}</TableCell>
                          <TableCell className="text-right">{player.RunsScored}</TableCell>
                          <TableCell className="text-right">{player.Games}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="bowling">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead className="text-right">Wickets</TableHead>
                        <TableHead className="text-right">Overs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topBowlers.map((player) => (
                        <TableRow key={player.Id}>
                          <TableCell className="font-medium">{player.UserName}</TableCell>
                          <TableCell>{player.TeamName}</TableCell>
                          <TableCell>{player.DivisionName}</TableCell>
                          <TableCell className="text-right">{player.Wickets}</TableCell>
                          <TableCell className="text-right">{player.Overs}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
