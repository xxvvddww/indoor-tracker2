
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { fetchFixtures, fetchPlayerStats, getCurrentSeasonId, DEFAULT_LEAGUE_ID } from "../services/cricketApi";
import { Fixture, Player } from "../types/cricket";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { 
  ArrowUpRight, 
  Calendar, 
  Star, 
  Award, 
  Users, 
  Shield, 
  Trophy, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { ResponsiveCard } from "@/components/ui/responsive-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResponsiveTable } from "@/components/ui/responsive-table";

const formatDate = (dateString: string) => {
  try {
    if (!dateString || dateString.trim() === '') {
      return 'N/A';
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString;
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
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateString);
  return date > today;
};

const calculateBattingAverage = (player: Player) => {
  const runsScored = parseInt(player.RunsScored);
  const timesOut = parseInt(player.TimesOut);
  
  if (timesOut === 0) return runsScored > 0 ? "∞" : "-";
  
  const average = runsScored / timesOut;
  return average.toFixed(2);
};

const calculateBowlingAverage = (player: Player) => {
  const runsConceded = parseInt(player.RunsConceded);
  const wickets = parseInt(player.Wickets);
  
  if (wickets === 0) return "-";
  
  const average = runsConceded / wickets;
  return average.toFixed(2);
};

const calculatePerformanceTrend = (player: Player) => {
  const runsScored = parseInt(player.RunsScored);
  const wickets = parseInt(player.Wickets);
  
  if (runsScored > 100 || wickets > 5) {
    return "up";
  } else if (runsScored < 20 && parseInt(player.Games) > 3) {
    return "down";
  }
  
  return "neutral";
};

const Index = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatsTab, setActiveStatsTab] = useState<"batting" | "bowling">("batting");
  const [expandedSection, setExpandedSection] = useState<string | null>("topPlayers");
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
    
  const completedMatchesCount = fixtures.filter(f => f.CompletionStatus === "Completed").length;
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const renderEmptyState = () => {
    if (fixtures.length === 0 && players.length === 0 && !loading) {
      return (
        <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
          <Award className="mx-auto h-12 w-12 text-primary/50" />
          <h2 className="mt-2 text-xl font-medium">No Cricket Data Available</h2>
          <p className="mt-2 text-sm text-muted-foreground">
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

  const mostRunsPlayer = topBatsmen.length > 0 ? topBatsmen[0] : null;
  const mostWicketsPlayer = topBowlers.length > 0 ? topBowlers[0] : null;

  // Recent results table columns
  const recentResultsColumns = [
    {
      key: "teams",
      header: "Match",
      render: (value: any, row: Fixture) => (
        <div className="flex flex-col">
          <span className="font-medium text-xs">{row.HomeTeam} vs {row.AwayTeam}</span>
          {row.DivisionName && <span className="text-xxs text-muted-foreground">{row.DivisionName}</span>}
        </div>
      ),
    },
    {
      key: "Date",
      header: "Date",
      render: (value: string) => <span className="text-xs">{formatCompactDate(value)}</span>,
      hideOnMobile: false,
    },
    {
      key: "result",
      header: "Result",
      render: (value: any, row: Fixture) => (
        <div className="flex justify-between items-center gap-2">
          <span className="text-xs font-medium truncate">
            {row.ScoreDescription || `${row.HomeTeamScore}-${row.AwayTeamScore}`}
          </span>
          <Link to={`/match/${row.Id}`} className="text-primary">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ),
    },
  ];

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
          <div className={`flex justify-center items-center h-[60vh]`}>
            <LoadingSpinner size={compactMode ? 8 : 12} />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            {error}
          </div>
        ) : renderEmptyState() || (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {/* Card 1: Active Players */}
              <ResponsiveCard 
                className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800"
              >
                <div className="p-3 flex flex-col items-center text-center">
                  <Users className={`${compactMode ? 'h-5 w-5' : 'h-7 w-7'} text-purple-500 mb-1`} />
                  <h3 className={`${compactMode ? 'text-xs' : 'text-sm'} font-medium text-purple-700 dark:text-purple-300 mb-0.5`}>
                    Active Players
                  </h3>
                  <p className={`${compactMode ? 'text-lg' : 'text-xl'} font-bold text-purple-800 dark:text-purple-200`}>
                    {players.length}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                    This season
                  </p>
                </div>
              </ResponsiveCard>
              
              {/* Card 2: Completed Matches */}
              <ResponsiveCard 
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
              >
                <div className="p-3 flex flex-col items-center text-center">
                  <Trophy className={`${compactMode ? 'h-5 w-5' : 'h-7 w-7'} text-green-500 mb-1`} />
                  <h3 className={`${compactMode ? 'text-xs' : 'text-sm'} font-medium text-green-700 dark:text-green-300 mb-0.5`}>
                    Completed Matches
                  </h3>
                  <p className={`${compactMode ? 'text-lg' : 'text-xl'} font-bold text-green-800 dark:text-green-200`}>
                    {completedMatchesCount}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                    This season
                  </p>
                </div>
              </ResponsiveCard>
              
              {/* Card 3: Most Wickets */}
              <ResponsiveCard 
                className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800"
              >
                <div className="p-3 flex flex-col items-center text-center">
                  <Star className={`${compactMode ? 'h-5 w-5' : 'h-7 w-7'} text-emerald-500 mb-1`} />
                  <h3 className={`${compactMode ? 'text-xs' : 'text-sm'} font-medium text-emerald-700 dark:text-emerald-300 mb-0.5`}>
                    Most Wickets
                  </h3>
                  {mostWicketsPlayer ? (
                    <>
                      <p className={`${compactMode ? 'text-lg' : 'text-xl'} font-bold text-emerald-800 dark:text-emerald-200`}>
                        {mostWicketsPlayer.Wickets}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 truncate max-w-full">
                        {mostWicketsPlayer.UserName}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className={`${compactMode ? 'text-lg' : 'text-xl'} font-bold text-emerald-800 dark:text-emerald-200`}>
                        -
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                        No data
                      </p>
                    </>
                  )}
                </div>
              </ResponsiveCard>
              
              {/* Card 4: Most Runs */}
              <ResponsiveCard 
                className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800"
              >
                <div className="p-3 flex flex-col items-center text-center">
                  <Award className={`${compactMode ? 'h-5 w-5' : 'h-7 w-7'} text-amber-500 mb-1`} />
                  <h3 className={`${compactMode ? 'text-xs' : 'text-sm'} font-medium text-amber-700 dark:text-amber-300 mb-0.5`}>
                    Most Runs
                  </h3>
                  {mostRunsPlayer ? (
                    <>
                      <p className={`${compactMode ? 'text-lg' : 'text-xl'} font-bold text-amber-800 dark:text-amber-200`}>
                        {mostRunsPlayer.RunsScored}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 truncate max-w-full">
                        {mostRunsPlayer.UserName}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className={`${compactMode ? 'text-lg' : 'text-xl'} font-bold text-amber-800 dark:text-amber-200`}>
                        -
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                        No data
                      </p>
                    </>
                  )}
                </div>
              </ResponsiveCard>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3 space-y-4">
                <Collapsible 
                  open={expandedSection === "recentResults"} 
                  onOpenChange={() => toggleSection("recentResults")}
                  className="border rounded-lg shadow-sm"
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex justify-between items-center p-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-primary mr-2" />
                        <span className="font-semibold">Recent Results</span>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-0 pb-2">
                    {recentFixtures.length > 0 ? (
                      <div className="space-y-2">
                        {compactMode ? (
                          <ResponsiveTable
                            data={recentFixtures}
                            columns={recentResultsColumns}
                            keyField="Id"
                            superCompact={true}
                            darkMode={true}
                            className="px-2"
                          />
                        ) : (
                          <div className="px-4 space-y-3">
                            {recentFixtures.map((fixture) => (
                              <div key={fixture.Id} className="bg-background/30 p-3 rounded-md border">
                                <p className="text-xs text-muted-foreground">
                                  {formatCompactDate(fixture.Date)}
                                  {fixture.DivisionName && <span> • {fixture.DivisionName}</span>}
                                </p>
                                <div className="flex justify-between items-center mt-1">
                                  <p className="font-medium">
                                    {fixture.HomeTeam} vs {fixture.AwayTeam}
                                  </p>
                                  <Link to={`/match/${fixture.Id}`} className="text-primary">
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Link>
                                </div>
                                <p className="text-sm mt-1 font-medium">
                                  {fixture.ScoreDescription || `${fixture.HomeTeamScore} - ${fixture.AwayTeamScore}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-center mt-3">
                          <Link 
                            to="/fixtures" 
                            className="text-sm text-primary hover:underline inline-flex items-center"
                          >
                            View All Results <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground px-4">
                        No recent results available
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
                
                <Collapsible 
                  open={expandedSection === "topPlayers"} 
                  onOpenChange={() => toggleSection("topPlayers")}
                  className="border rounded-lg shadow-sm"
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex justify-between items-center p-4">
                      <div className="flex items-center">
                        <BarChart3 className="h-5 w-5 text-primary mr-2" />
                        <span className="font-semibold">Top Performers</span>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <Tabs 
                      defaultValue="batting" 
                      value={activeStatsTab} 
                      onValueChange={(value) => setActiveStatsTab(value as "batting" | "bowling")}
                      className="w-full"
                    >
                      <TabsList className="w-full grid grid-cols-2 mb-4">
                        <TabsTrigger value="batting">Batting</TabsTrigger>
                        <TabsTrigger value="bowling">Bowling</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="batting" className="mt-0">
                        <div className="space-y-2">
                          {topBatsmen.slice(0, 3).map((player, index) => (
                            <div key={player.Id} className={cn(
                              "flex items-center justify-between p-3 rounded-lg",
                              index === 0 ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" :
                              index === 1 ? "bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800" :
                              "bg-background border"
                            )}>
                              <div className="flex items-center">
                                {index === 0 && <Trophy className="h-4 w-4 text-amber-500 mr-1" />}
                                <div>
                                  <p className="font-medium">{player.UserName}</p>
                                  <p className="text-xs text-muted-foreground">{player.TeamName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">{player.RunsScored}</p>
                                <p className="text-xs text-muted-foreground">runs</p>
                              </div>
                            </div>
                          ))}
                          <div className="text-center mt-2">
                            <Link 
                              to="/stats" 
                              className="text-sm text-primary hover:underline inline-flex items-center"
                            >
                              View All Batsmen <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="bowling" className="mt-0">
                        <div className="space-y-2">
                          {topBowlers.slice(0, 3).map((player, index) => (
                            <div key={player.Id} className={cn(
                              "flex items-center justify-between p-3 rounded-lg",
                              index === 0 ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" :
                              index === 1 ? "bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800" :
                              "bg-background border"
                            )}>
                              <div className="flex items-center">
                                {index === 0 && <Trophy className="h-4 w-4 text-emerald-500 mr-1" />}
                                <div>
                                  <p className="font-medium">{player.UserName}</p>
                                  <p className="text-xs text-muted-foreground">{player.TeamName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">{player.Wickets}</p>
                                <p className="text-xs text-muted-foreground">wickets</p>
                              </div>
                            </div>
                          ))}
                          <div className="text-center mt-2">
                            <Link 
                              to="/stats" 
                              className="text-sm text-primary hover:underline inline-flex items-center"
                            >
                              View All Bowlers <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        )}
      </ResponsiveContainer>
    </MainLayout>
  );
};

export default Index;
