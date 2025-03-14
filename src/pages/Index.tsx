
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { fetchFixtures, fetchPlayerStats, getCurrentSeasonId, DEFAULT_LEAGUE_ID } from "../services/cricketApi";
import { Fixture, Player } from "../types/cricket";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ArrowUpRight, Calendar, Star, Award, Users, Shield, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { ResponsiveCard } from "@/components/ui/responsive-card";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";

const formatDate = (dateString: string) => {
  try {
    if (!dateString || dateString.trim() === '') {
      return 'N/A';
    }
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return the original string if not a valid date
    }
    
    return new Intl.DateTimeFormat('en-AU', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error, "for date string:", dateString);
    return dateString || 'N/A';
  }
};

const formatCompactDate = (dateString: string) => {
  try {
    if (!dateString || dateString.trim() === '') {
      return 'N/A';
    }
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  } catch (error) {
    return dateString || 'N/A';
  }
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
  const [error, setError] = useState<string | null>(null);
  const seasonId = getCurrentSeasonId();
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [fixturesData, playersData] = await Promise.all([
          fetchFixtures(DEFAULT_LEAGUE_ID, seasonId),
          fetchPlayerStats(DEFAULT_LEAGUE_ID, seasonId)
        ]);
        
        setFixtures(fixturesData);
        setPlayers(playersData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load data. Please try again later.");
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [seasonId]);
  
  const upcomingFixtures = fixtures
    .filter(fixture => isFutureDate(fixture.Date))
    .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
    .slice(0, 5);
    
  const recentFixtures = fixtures
    .filter(fixture => !isFutureDate(fixture.Date) && fixture.CompletionStatus === "Completed")
    .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
    .slice(0, 5);
  
  const topBatsmen = [...players]
    .sort((a, b) => parseInt(b.RunsScored) - parseInt(a.RunsScored))
    .slice(0, 5);
    
  const topBowlers = [...players]
    .sort((a, b) => parseInt(b.Wickets) - parseInt(a.Wickets))
    .slice(0, 5);

  const renderEmptyState = () => {
    if (fixtures.length === 0 && players.length === 0 && !loading) {
      return (
        <div className={`bg-card rounded-lg border shadow-sm ${isMobile ? 'p-3' : 'p-6'} text-center`}>
          <Award className={`mx-auto ${isMobile ? 'h-8 w-8' : 'h-12 w-12'} text-primary/50`} />
          <h2 className={`mt-2 ${isMobile ? 'text-lg' : 'text-xl'} font-medium`}>No Cricket Data Available</h2>
          <p className={`mt-2 ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            There are no fixtures or statistics available for the current season.
          </p>
          <div className="mt-4">
            <Link to="/settings" className="text-primary hover:underline text-sm">
              Go to Settings
            </Link>
          </div>
        </div>
      );
    }
    return null;
  };

  const compactMode = isMobile;

  return (
    <MainLayout>
      <ResponsiveContainer spacing={compactMode ? 'xs' : 'md'}>
        <div className="flex items-center justify-between">
          <h1 className={`${compactMode ? 'text-xl' : 'text-3xl'} font-bold tracking-tight`}>Dashboard</h1>
          {!compactMode && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Season ID: {seasonId}</span>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className={`flex justify-center items-center ${compactMode ? 'h-36' : 'h-96'}`}>
            <LoadingSpinner size={compactMode ? 6 : 8} />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            {error}
          </div>
        ) : renderEmptyState() || (
          <>
            {/* Stats summary cards */}
            <div className={`grid grid-cols-3 gap-${compactMode ? '1' : '4'}`}>
              <Card className={compactMode ? 'p-0' : ''}>
                <CardContent className={compactMode ? 'p-2 pt-2' : 'pt-6'}>
                  <div className="flex items-center space-x-2">
                    <Calendar className={`${compactMode ? 'h-7 w-7' : 'h-10 w-10'} text-primary p-1 border rounded-full`} />
                    <div>
                      <p className={`${compactMode ? 'text-xxs' : 'text-sm'} text-muted-foreground`}>Fixtures</p>
                      <h3 className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold`}>
                        {fixtures.length}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={compactMode ? 'p-0' : ''}>
                <CardContent className={compactMode ? 'p-2 pt-2' : 'pt-6'}>
                  <div className="flex items-center space-x-2">
                    <Users className={`${compactMode ? 'h-7 w-7' : 'h-10 w-10'} text-primary p-1 border rounded-full`} />
                    <div>
                      <p className={`${compactMode ? 'text-xxs' : 'text-sm'} text-muted-foreground`}>Players</p>
                      <h3 className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold`}>
                        {players.length}
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
                      <p className={`${compactMode ? 'text-xxs' : 'text-sm'} text-muted-foreground truncate`}>
                        {compactMode ? "Completed" : "Completed Matches"}
                      </p>
                      <h3 className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold`}>
                        {fixtures.filter(f => f.CompletionStatus === "Completed").length}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fixtures section */}
            <ResponsiveCard
              className={compactMode ? 'shadow-none border-0 p-0' : ''}
              title={
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-1">
                    <Calendar className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
                    <span className={compactMode ? 'text-sm font-medium' : 'text-lg font-semibold'}>
                      Upcoming Fixtures
                    </span>
                  </div>
                  {!compactMode && (
                    <Link to="/fixtures" className="text-sm text-primary flex items-center">
                      View All <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  )}
                </div>
              }
            >
              {upcomingFixtures.length > 0 ? (
                <div className={`space-y-${compactMode ? '1' : '2'}`}>
                  {upcomingFixtures.map((fixture) => (
                    <div key={fixture.Id} className={`bg-background ${compactMode ? 'p-2' : 'p-3'} rounded-md`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`${compactMode ? 'text-xxs' : 'text-xs'} text-muted-foreground`}>
                            {isToday(fixture.Date) ? "Today" : (compactMode ? formatCompactDate(fixture.Date) : formatDate(fixture.Date))} 
                            {fixture.DivisionName && <span> • {fixture.DivisionName}</span>}
                          </p>
                          <p className={`font-medium ${compactMode ? 'text-xs mt-0.5' : 'mt-1'}`}>
                            {fixture.HomeTeam} vs {fixture.AwayTeam}
                          </p>
                          {!compactMode && fixture.Venue && fixture.StartTime && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {fixture.Venue} • {fixture.StartTime}
                            </p>
                          )}
                        </div>
                        <Link to={`/match/${fixture.Id}`} className="text-primary">
                          <ArrowUpRight className={`${compactMode ? 'h-3 w-3' : 'h-4 w-4'}`} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`${compactMode ? 'py-4 text-xs' : 'py-8 text-sm'} text-center text-muted-foreground`}>
                  No upcoming fixtures found
                </div>
              )}
            </ResponsiveCard>

            {/* Recent Results */}
            <ResponsiveCard
              className={compactMode ? 'shadow-none border-0 p-0' : ''}
              title={
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-1">
                    <Award className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
                    <span className={compactMode ? 'text-sm font-medium' : 'text-lg font-semibold'}>
                      Recent Results
                    </span>
                  </div>
                  {!compactMode && (
                    <Link to="/fixtures" className="text-sm text-primary flex items-center">
                      View All <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  )}
                </div>
              }
            >
              {recentFixtures.length > 0 ? (
                <div className={`space-y-${compactMode ? '1' : '2'}`}>
                  {recentFixtures.map((fixture) => (
                    <div key={fixture.Id} className={`bg-background ${compactMode ? 'p-2' : 'p-3'} rounded-md`}>
                      <div className="flex justify-between items-start">
                        <div className="w-full">
                          <p className={`${compactMode ? 'text-xxs' : 'text-xs'} text-muted-foreground`}>
                            {compactMode ? formatCompactDate(fixture.Date) : formatDate(fixture.Date)}
                            {fixture.DivisionName && <span> • {fixture.DivisionName}</span>}
                          </p>
                          <p className={`font-medium ${compactMode ? 'text-xs mt-0.5' : 'mt-1'}`}>
                            {fixture.HomeTeam} vs {fixture.AwayTeam}
                          </p>
                          <p className={`${compactMode ? 'text-xs' : 'text-sm'} ${compactMode ? 'mt-0.5' : 'mt-1'}`}>
                            {fixture.ScoreDescription || `${fixture.HomeTeamScore} - ${fixture.AwayTeamScore}`}
                          </p>
                        </div>
                        <Link to={`/match/${fixture.Id}`} className="text-primary ml-1 shrink-0">
                          <ArrowUpRight className={`${compactMode ? 'h-3 w-3' : 'h-4 w-4'}`} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`${compactMode ? 'py-4 text-xs' : 'py-8 text-sm'} text-center text-muted-foreground`}>
                  No recent results found
                </div>
              )}
            </ResponsiveCard>

            {/* Player Stats */}
            <ResponsiveCard
              className={compactMode ? 'shadow-none border-0 p-0' : ''}
              title={
                <div className="flex items-center gap-1">
                  <Star className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
                  <span className={compactMode ? 'text-sm font-medium' : 'text-lg font-semibold'}>
                    Player Statistics
                  </span>
                </div>
              }
            >
              <Tabs defaultValue="batting" className={compactMode ? 'px-0' : 'px-0'}>
                <TabsList className={`${compactMode ? 'h-8 mb-2' : 'mb-4'}`}>
                  <TabsTrigger value="batting" className={compactMode ? 'text-xs px-2 h-7' : ''}>Top Batsmen</TabsTrigger>
                  <TabsTrigger value="bowling" className={compactMode ? 'text-xs px-2 h-7' : ''}>Top Bowlers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="batting">
                  <ResponsiveTable 
                    keyField="Id"
                    superCompact={compactMode}
                    data={topBatsmen}
                    columns={[
                      { key: "UserName", header: "Player", className: compactMode ? "w-[80px]" : "" },
                      { key: "TeamName", header: "Team", hideOnMobile: compactMode },
                      { key: "DivisionName", header: "Division", hideOnMobile: !compactMode },
                      { key: "RunsScored", header: "Runs", className: "text-right" },
                      { key: "Games", header: "Games", className: "text-right", hideOnMobile: compactMode }
                    ]}
                  />
                </TabsContent>
                
                <TabsContent value="bowling">
                  <ResponsiveTable 
                    keyField="Id"
                    superCompact={compactMode}
                    data={topBowlers}
                    columns={[
                      { key: "UserName", header: "Player", className: compactMode ? "w-[80px]" : "" },
                      { key: "TeamName", header: "Team", hideOnMobile: compactMode },
                      { key: "DivisionName", header: "Division", hideOnMobile: !compactMode },
                      { key: "Wickets", header: "Wickets", className: "text-right" },
                      { key: "Overs", header: "Overs", className: "text-right", hideOnMobile: compactMode }
                    ]}
                  />
                </TabsContent>
              </Tabs>
            </ResponsiveCard>
          </>
        )}
      </ResponsiveContainer>
    </MainLayout>
  );
};

export default Index;
