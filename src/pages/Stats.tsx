
import React, { useState, useEffect } from 'react';
import MainLayout from "../components/layout/MainLayout";
import { fetchPlayerStats, DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID } from "../services/cricketApi";
import { Player } from "../types/cricket";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ArrowDown, ArrowUp, Filter, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveCard } from "@/components/ui/responsive-card";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { ResponsiveTable } from "@/components/ui/responsive-table";

const Stats = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const isMobile = useIsMobile();
  
  // Get unique teams for filter dropdown
  const teams = [...new Set(players.map(player => player.TeamName))].sort();

  // DEFINE CALCULATION FUNCTIONS FIRST
  // Calculate batting average (runs / times out)
  const calculateBattingAverage = (player: Player) => {
    const runsScored = parseInt(player.RunsScored);
    const timesOut = parseInt(player.TimesOut);
    
    if (timesOut === 0) return runsScored > 0 ? "∞" : "-";
    
    const average = runsScored / timesOut;
    return average.toFixed(2);
  };

  // Calculate bowling average (runs conceded / wickets)
  const calculateBowlingAverage = (player: Player) => {
    const runsConceded = parseInt(player.RunsConceded);
    const wickets = parseInt(player.Wickets);
    
    if (wickets === 0) return "-";
    
    const average = runsConceded / wickets;
    return average.toFixed(2);
  };

  // Calculate batting strike rate (runs / balls faced * 100)
  const calculateStrikeRate = (player: Player) => {
    const runsScored = parseInt(player.RunsScored);
    const ballsFaced = parseInt(player.BallsFaced);
    
    if (ballsFaced === 0) return "-";
    
    const strikeRate = (runsScored / ballsFaced) * 100;
    return strikeRate.toFixed(2);
  };

  useEffect(() => {
    const loadPlayerStats = async () => {
      setLoading(true);
      try {
        const playerData = await fetchPlayerStats(DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID);
        setPlayers(playerData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch player stats:", err);
        setError("Failed to load player statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadPlayerStats();
  }, []);

  // Filter players by search term, active tab, and team filter
  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.UserName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      player.TeamName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = teamFilter === "all" ? true : player.TeamName === teamFilter;
    
    if (activeTab === "all") return matchesSearch && matchesTeam;
    if (activeTab === "batsmen") return matchesSearch && matchesTeam && parseInt(player.RunsScored) > 0;
    if (activeTab === "bowlers") return matchesSearch && matchesTeam && parseInt(player.Wickets) > 0;
    
    return matchesSearch && matchesTeam;
  });

  // Sort filtered players
  const sortedPlayers = sortBy 
    ? [...filteredPlayers].sort((a, b) => {
        let valueA, valueB;
        
        // Handle special calculated fields
        if (sortBy === "battingAverage") {
          valueA = calculateBattingAverage(a);
          valueB = calculateBattingAverage(b);
        } else if (sortBy === "strikeRate") {
          valueA = calculateStrikeRate(a);
          valueB = calculateStrikeRate(b);
        } else if (sortBy === "bowlingAverage") {
          valueA = calculateBowlingAverage(a);
          valueB = calculateBowlingAverage(b);
        } else {
          // For direct player properties
          valueA = a[sortBy as keyof Player];
          valueB = b[sortBy as keyof Player];
  
          // Convert string numbers to actual numbers for sorting
          if (!isNaN(Number(valueA)) && !isNaN(Number(valueB))) {
            valueA = Number(valueA);
            valueB = Number(valueB);
          }
        }
        
        // Handle non-numeric/special values
        if (valueA === "-" || valueA === "∞" || valueA === "N/A") valueA = sortDirection === "asc" ? Infinity : -Infinity;
        if (valueB === "-" || valueB === "∞" || valueB === "N/A") valueB = sortDirection === "asc" ? Infinity : -Infinity;
        
        return sortDirection === "asc" 
          ? valueA < valueB ? -1 : valueA > valueB ? 1 : 0
          : valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }) 
    : filteredPlayers;

  // Sorting handler
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort direction if clicking the same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Default to descending for new column
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  // Render sort indicator
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === "asc" ? <ArrowUp className="ml-1 h-3 w-3 inline" /> : <ArrowDown className="ml-1 h-3 w-3 inline" />;
  };

  const compactMode = isMobile;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size={compactMode ? 8 : 12} />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ResponsiveContainer spacing={compactMode ? 'xs' : 'md'}>
          <h1 className={`${compactMode ? 'text-xl' : 'text-3xl'} font-bold tracking-tight`}>Player Statistics</h1>
          <div className={`bg-card rounded-lg border shadow-sm ${compactMode ? 'p-3' : 'p-6'} text-center`}>
            <p className="text-red-500">{error}</p>
          </div>
        </ResponsiveContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ResponsiveContainer spacing={compactMode ? 'xs' : 'md'}>
        <h1 className={`${compactMode ? 'text-xl' : 'text-3xl'} font-bold tracking-tight`}>Player Statistics</h1>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={compactMode ? "Search..." : "Search players or teams..."}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full">
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className={`w-full ${compactMode ? 'text-xs h-8' : ''}`}>
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <ResponsiveCard 
          className={compactMode ? 'shadow-none border-0 p-0' : ''}
        >
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className={`w-full justify-start ${compactMode ? 'mb-2 h-8' : 'px-6 pt-4'}`}>
              <TabsTrigger value="all" className={compactMode ? 'text-xs h-7 px-2' : 'px-4'}>All Players</TabsTrigger>
              <TabsTrigger value="batsmen" className={compactMode ? 'text-xs h-7 px-2' : 'px-4'}>Batsmen</TabsTrigger>
              <TabsTrigger value="bowlers" className={compactMode ? 'text-xs h-7 px-2' : 'px-4'}>Bowlers</TabsTrigger>
            </TabsList>
            
            <div className="p-0">
              <ScrollArea className={compactMode ? 'h-[calc(100vh-160px)]' : 'h-[calc(100vh-260px)]'}>
                <TabsContent value="all" className="mt-0 pt-0">
                  <ResponsiveTable
                    keyField="Id"
                    superCompact={compactMode}
                    data={sortedPlayers}
                    columns={[
                      { 
                        key: "UserName", 
                        header: "Player",
                        className: compactMode ? "w-[100px]" : "",
                        render: (value) => (
                          <span className="font-medium">{value}</span>
                        )
                      },
                      { 
                        key: "TeamName", 
                        header: "Team",
                        hideOnMobile: compactMode 
                      },
                      { 
                        key: "Games", 
                        header: compactMode ? "G" : "Games",
                        className: "text-center" 
                      },
                      { 
                        key: "RunsScored", 
                        header: compactMode ? "R" : "Runs",
                        className: "text-center" 
                      },
                      { 
                        key: "battingAverage", 
                        header: compactMode ? "Avg" : "Batting Avg",
                        className: "text-center",
                        render: (_, row) => calculateBattingAverage(row)
                      },
                      { 
                        key: "Wickets", 
                        header: compactMode ? "W" : "Wickets",
                        className: "text-center" 
                      },
                      { 
                        key: "bowlingAverage", 
                        header: compactMode ? "B/Avg" : "Bowling Avg",
                        className: "text-center",
                        hideOnMobile: compactMode,
                        render: (_, row) => calculateBowlingAverage(row)
                      }
                    ]}
                  />
                </TabsContent>

                <TabsContent value="batsmen" className="mt-0 pt-0">
                  <ResponsiveTable
                    keyField="Id"
                    superCompact={compactMode}
                    data={sortedPlayers}
                    columns={[
                      { 
                        key: "UserName", 
                        header: "Player",
                        className: compactMode ? "w-[100px]" : "",
                        render: (value) => (
                          <span className="font-medium">{value}</span>
                        )
                      },
                      { 
                        key: "TeamName", 
                        header: "Team",
                        hideOnMobile: compactMode 
                      },
                      { 
                        key: "Games", 
                        header: compactMode ? "G" : "Games",
                        className: "text-center" 
                      },
                      { 
                        key: "RunsScored", 
                        header: compactMode ? "R" : "Runs",
                        className: "text-center" 
                      },
                      { 
                        key: "battingAverage", 
                        header: compactMode ? "Avg" : "Batting Avg",
                        className: "text-center",
                        render: (_, row) => calculateBattingAverage(row)
                      },
                      { 
                        key: "strikeRate", 
                        header: compactMode ? "S/R" : "Strike Rate",
                        className: "text-center",
                        hideOnMobile: compactMode,
                        render: (_, row) => calculateStrikeRate(row)
                      }
                    ]}
                  />
                </TabsContent>

                <TabsContent value="bowlers" className="mt-0 pt-0">
                  <ResponsiveTable
                    keyField="Id"
                    superCompact={compactMode}
                    data={sortedPlayers}
                    columns={[
                      { 
                        key: "UserName", 
                        header: "Player",
                        className: compactMode ? "w-[100px]" : "",
                        render: (value) => (
                          <span className="font-medium">{value}</span>
                        )
                      },
                      { 
                        key: "TeamName", 
                        header: "Team",
                        hideOnMobile: compactMode 
                      },
                      { 
                        key: "Games", 
                        header: compactMode ? "G" : "Games",
                        className: "text-center" 
                      },
                      { 
                        key: "Overs", 
                        header: compactMode ? "O" : "Overs",
                        className: "text-center" 
                      },
                      { 
                        key: "Wickets", 
                        header: compactMode ? "W" : "Wickets",
                        className: "text-center" 
                      },
                      { 
                        key: "bowlingAverage", 
                        header: compactMode ? "Avg" : "Bowling Avg",
                        className: "text-center",
                        render: (_, row) => calculateBowlingAverage(row)
                      }
                    ]}
                  />
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        </ResponsiveCard>
      </ResponsiveContainer>
    </MainLayout>
  );
};

export default Stats;
