
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
  
  const upcomingFixture = fixtures
    .filter(fixture => isFutureDate(fixture.Date))
    .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())[0];
    
  const recentFixtures = fixtures
    .filter(fixture => !isFutureDate(fixture.Date) && fixture.CompletionStatus === "Completed")
    .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
    .slice(0, 3);
  
  const topBatsmen = [...players]
    .sort((a, b) => parseInt(b.RunsScored) - parseInt(a.RunsScored))
    .slice(0, 5);
    
  const topBowlers = [...players]
    .sort((a, b) => parseInt(b.Wickets) - parseInt(a.Wickets))
    .slice(0, 5);
    
  const completedMatchesCount = fixtures.filter(f => f.CompletionStatus === "Completed").length;
  const totalMatchesCount = fixtures.length;
  const seasonProgressPercentage = totalMatchesCount > 0 
    ? Math.round((completedMatchesCount / totalMatchesCount) * 100) 
    : 0;
    
  const standoutPlayer = players.length > 0 
    ? players.reduce((best, current) => {
        const bestScore = parseInt(best.RunsScored) + parseInt(best.Wickets) * 20;
        const currentScore = parseInt(current.RunsScored) + parseInt(current.Wickets) * 20;
        return currentScore > bestScore ? current : best;
      })
    : null;
    
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

  const renderTrendIndicator = (trend: "up" | "down" | "neutral") => {
    if (trend === "up") {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend === "down") {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
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
          <div className={`flex justify-center items-center h-[60vh]`}>
            <LoadingSpinner size={compactMode ? 8 : 12} />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            {error}
          </div>
        ) : renderEmptyState() || (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <ResponsiveCard 
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
              >
                <div className="p-4 flex flex-col items-center text-center">
                  <Calendar className={`${compactMode ? 'h-6 w-6' : 'h-8 w-8'} text-blue-500 mb-2`} />
                  <h3 className={`${compactMode ? 'text-sm' : 'text-base'} font-medium text-blue-700 dark:text-blue-300 mb-1`}>
                    Season Progress
                  </h3>
                  <p className={`${compactMode ? 'text-xl' : 'text-2xl'} font-bold text-blue-800 dark:text-blue-200`}>
                    {seasonProgressPercentage}%
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {completedMatchesCount} of {totalMatchesCount} matches played
                  </p>
                </div>
              </ResponsiveCard>
              
              <ResponsiveCard 
                className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800"
              >
                <div className="p-4 flex flex-col items-center text-center">
                  <Users className={`${compactMode ? 'h-6 w-6' : 'h-8 w-8'} text-purple-500 mb-2`} />
                  <h3 className={`${compactMode ? 'text-sm' : 'text-base'} font-medium text-purple-700 dark:text-purple-300 mb-1`}>
                    Active Players
                  </h3>
                  <p className={`${compactMode ? 'text-xl' : 'text-2xl'} font-bold text-purple-800 dark:text-purple-200`}>
                    {players.length}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Across all teams
                  </p>
                </div>
              </ResponsiveCard>
              
              <ResponsiveCard 
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
              >
                <div className="p-4 flex flex-col items-center text-center">
                  <Trophy className={`${compactMode ? 'h-6 w-6' : 'h-8 w-8'} text-green-500 mb-2`} />
                  <h3 className={`${compactMode ? 'text-sm' : 'text-base'} font-medium text-green-700 dark:text-green-300 mb-1`}>
                    Completed Matches
                  </h3>
                  <p className={`${compactMode ? 'text-xl' : 'text-2xl'} font-bold text-green-800 dark:text-green-200`}>
                    {completedMatchesCount}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    This season
                  </p>
                </div>
              </ResponsiveCard>
              
              <ResponsiveCard 
                className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800"
              >
                <div className="p-4 flex flex-col items-center text-center">
                  <Calendar className={`${compactMode ? 'h-6 w-6' : 'h-8 w-8'} text-amber-500 mb-2`} />
                  <h3 className={`${compactMode ? 'text-sm' : 'text-base'} font-medium text-amber-700 dark:text-amber-300 mb-1`}>
                    Upcoming Matches
                  </h3>
                  <p className={`${compactMode ? 'text-xl' : 'text-2xl'} font-bold text-amber-800 dark:text-amber-200`}>
                    {fixtures.filter(fixture => isFutureDate(fixture.Date)).length}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Scheduled
                  </p>
                </div>
              </ResponsiveCard>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 space-y-4">
                {upcomingFixture ? (
                  <ResponsiveCard 
                    className="border-l-4 border-l-blue-500 shadow-md"
                    title={
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="font-semibold">Next Match</span>
                      </div>
                    }
                  >
                    <div className="p-1">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {isToday(upcomingFixture.Date) ? "TODAY" : formatDate(upcomingFixture.Date)}
                        </p>
                        <h3 className="text-lg font-bold mt-2 mb-1">
                          {upcomingFixture.HomeTeam} vs {upcomingFixture.AwayTeam}
                        </h3>
                        {upcomingFixture.Venue && (
                          <p className="text-sm text-muted-foreground">
                            {upcomingFixture.Venue}
                          </p>
                        )}
                        {upcomingFixture.StartTime && (
                          <p className="text-sm font-medium mt-2 text-blue-600 dark:text-blue-400">
                            Starts at {upcomingFixture.StartTime}
                          </p>
                        )}
                        <Link 
                          to={`/match/${upcomingFixture.Id}`}
                          className="inline-block mt-3 px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                          Match Details
                        </Link>
                      </div>
                    </div>
                  </ResponsiveCard>
                ) : (
                  <ResponsiveCard 
                    className="border-l-4 border-l-muted shadow-md"
                    title={
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                        <span className="font-semibold">Next Match</span>
                      </div>
                    }
                  >
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">No upcoming matches scheduled</p>
                    </div>
                  </ResponsiveCard>
                )}
                
                <Collapsible 
                  open={expandedSection === "recentResults"} 
                  onOpenChange={() => toggleSection("recentResults")}
                  className="border rounded-lg shadow-sm"
                >
                  <CollapsibleTrigger className="w-full">
                    <Button variant="ghost" className="w-full flex justify-between items-center p-4">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-primary mr-2" />
                        <span className="font-semibold">Recent Results</span>
                      </div>
                      {expandedSection === "recentResults" ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    {recentFixtures.length > 0 ? (
                      <div className="space-y-3">
                        {recentFixtures.map((fixture) => (
                          <div key={fixture.Id} className="bg-background p-3 rounded-md border">
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
                      <div className="text-center py-4 text-muted-foreground">
                        No recent results available
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                {standoutPlayer && (
                  <ResponsiveCard 
                    className="border-l-4 border-l-amber-500 shadow-md"
                    title={
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-amber-500 mr-2" />
                        <span className="font-semibold">Standout Player</span>
                      </div>
                    }
                  >
                    <div className="px-1 py-2">
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200">
                              {standoutPlayer.UserName}
                            </h3>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                              {standoutPlayer.TeamName}
                            </p>
                            
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <div className="bg-white dark:bg-black/20 rounded p-2">
                                <p className="text-xs text-muted-foreground">Runs</p>
                                <p className="text-lg font-bold">{standoutPlayer.RunsScored}</p>
                              </div>
                              <div className="bg-white dark:bg-black/20 rounded p-2">
                                <p className="text-xs text-muted-foreground">Wickets</p>
                                <p className="text-lg font-bold">{standoutPlayer.Wickets}</p>
                              </div>
                              <div className="bg-white dark:bg-black/20 rounded p-2">
                                <p className="text-xs text-muted-foreground">Batting Avg</p>
                                <p className="text-lg font-bold">{calculateBattingAverage(standoutPlayer)}</p>
                              </div>
                              <div className="bg-white dark:bg-black/20 rounded p-2">
                                <p className="text-xs text-muted-foreground">Matches</p>
                                <p className="text-lg font-bold">{standoutPlayer.Games}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {renderTrendIndicator(calculatePerformanceTrend(standoutPlayer))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ResponsiveCard>
                )}
                
                <Collapsible 
                  open={expandedSection === "topPlayers"} 
                  onOpenChange={() => toggleSection("topPlayers")}
                  className="border rounded-lg shadow-sm"
                >
                  <CollapsibleTrigger className="w-full">
                    <Button variant="ghost" className="w-full flex justify-between items-center p-4">
                      <div className="flex items-center">
                        <BarChart3 className="h-5 w-5 text-primary mr-2" />
                        <span className="font-semibold">Top Performers</span>
                      </div>
                      {expandedSection === "topPlayers" ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
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
                
                <ResponsiveCard 
                  className="border-l-4 border-l-purple-500 shadow-md"
                  title={
                    <div className="flex items-center">
                      <Info className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="font-semibold">Cricket Insights</span>
                    </div>
                  }
                >
                  <div className="p-1">
                    <div className="space-y-2">
                      {topBatsmen.length > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <div className="flex">
                            <AlertCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                            <p className="text-sm">
                              <span className="font-medium">{topBatsmen[0].UserName}</span> leads the 
                              league with <span className="font-medium">{topBatsmen[0].RunsScored} runs</span> scored 
                              in {topBatsmen[0].Games} matches.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {topBowlers.length > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <div className="flex">
                            <AlertCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                            <p className="text-sm">
                              <span className="font-medium">{topBowlers[0].UserName}</span> has taken the 
                              most wickets with <span className="font-medium">{topBowlers[0].Wickets}</span> in 
                              {topBowlers[0].Games} matches.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {completedMatchesCount > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <div className="flex">
                            <AlertCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                            <p className="text-sm">
                              The season is <span className="font-medium">{seasonProgressPercentage}% complete</span> with
                              {' '}<span className="font-medium">{fixtures.filter(f => isFutureDate(f.Date)).length} matches</span> still 
                              to be played.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ResponsiveCard>
              </div>
            </div>
          </div>
        )}
      </ResponsiveContainer>
    </MainLayout>
  );
};

export default Index;
