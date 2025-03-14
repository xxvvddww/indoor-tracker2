
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { fetchFixtures, fetchPlayerStats, getCurrentSeasonId, DEFAULT_LEAGUE_ID } from "../services/cricketApi";
import { Fixture, Player } from "../types/cricket";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { isFutureDate } from "@/utils/dateFormatters";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentResults } from "@/components/dashboard/RecentResults";
import { TopPerformers } from "@/components/dashboard/TopPerformers";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { WatchLive } from "@/components/dashboard/WatchLive";

const Index = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatsTab, setActiveStatsTab] = useState<"batting" | "bowling">("batting");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeDivision, setActiveDivision] = useState<string>("all");
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
    
  const mostRecentDate = fixtures
    .filter(fixture => !isFutureDate(fixture.Date) && fixture.CompletionStatus === "Completed")
    .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
    .map(fixture => fixture.Date)[0];

  const recentFixtures = fixtures
    .filter(fixture => fixture.Date === mostRecentDate && fixture.CompletionStatus === "Completed")
    .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
  
  const getFilteredPlayers = () => {
    let filteredPlayers = [...players];
    
    if (activeDivision !== "all") {
      filteredPlayers = filteredPlayers.filter(player => 
        player.DivisionName === activeDivision
      );
    }
    
    return filteredPlayers;
  };
  
  const topBatsmen = getFilteredPlayers()
    .sort((a, b) => parseInt(b.RunsScored) - parseInt(a.RunsScored))
    .slice(0, 5);
    
  const topBowlers = getFilteredPlayers()
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

  const compactMode = isMobile;

  const mostRunsPlayer = topBatsmen.length > 0 ? topBatsmen[0] : null;
  const mostWicketsPlayer = topBowlers.length > 0 ? topBowlers[0] : null;

  const allDivisions = Array.from(new Set(players.map(p => p.DivisionName).filter(Boolean)));

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
        ) : (
          <>
            <EmptyState 
              fixturesLength={fixtures.length} 
              playersLength={players.length} 
              loading={loading} 
            />

            {(fixtures.length > 0 || players.length > 0) && (
              <div className="space-y-4">
                <StatCards 
                  playersCount={players.length}
                  completedMatchesCount={completedMatchesCount}
                  mostWicketsPlayer={mostWicketsPlayer}
                  mostRunsPlayer={mostRunsPlayer}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3 space-y-4">
                    <RecentResults
                      fixtures={recentFixtures}
                      mostRecentDate={mostRecentDate}
                      expandedSection={expandedSection}
                      toggleSection={toggleSection}
                    />
                    
                    <TopPerformers 
                      players={players}
                      activeDivision={activeDivision}
                      setActiveDivision={setActiveDivision}
                      activeStatsTab={activeStatsTab}
                      setActiveStatsTab={setActiveStatsTab}
                      allDivisions={allDivisions}
                      expandedSection={expandedSection}
                      toggleSection={toggleSection}
                    />
                    
                    <WatchLive
                      expandedSection={expandedSection}
                      toggleSection={toggleSection}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </ResponsiveContainer>
    </MainLayout>
  );
};

export default Index;
