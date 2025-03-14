
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

const Stats = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [teamFilter, setTeamFilter] = useState<string>("");
  
  // Get unique teams for filter dropdown
  const teams = [...new Set(players.map(player => player.TeamName))].sort();

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
    
    const matchesTeam = teamFilter ? player.TeamName === teamFilter : true;
    
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size={12} />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Player Statistics</h1>
          <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Player Statistics</h1>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search players or teams..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card className="border shadow-sm">
          <div className="border-b">
            <Tabs 
              defaultValue="all" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full justify-start px-6 pt-4">
                <TabsTrigger value="all" className="px-4">All Players</TabsTrigger>
                <TabsTrigger value="batsmen" className="px-4">Batsmen</TabsTrigger>
                <TabsTrigger value="bowlers" className="px-4">Bowlers</TabsTrigger>
              </TabsList>
              
              <div className="p-0">
                <ScrollArea className="h-[calc(100vh-260px)]">
                  <TabsContent value="all" className="mt-0 pt-2">
                    <Table>
                      <TableHeader className="bg-muted/50 sticky top-0">
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort("UserName")}
                          >
                            Player {renderSortIcon("UserName")}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort("TeamName")}
                          >
                            Team {renderSortIcon("TeamName")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("Games")}
                          >
                            Games {renderSortIcon("Games")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("RunsScored")}
                          >
                            Runs {renderSortIcon("RunsScored")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("battingAverage")}
                          >
                            Avg {renderSortIcon("battingAverage")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("strikeRate")}
                          >
                            S/R {renderSortIcon("strikeRate")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("Wickets")}
                          >
                            Wickets {renderSortIcon("Wickets")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("bowlingAverage")}
                          >
                            Bowling Avg {renderSortIcon("bowlingAverage")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedPlayers.length > 0 ? (
                          sortedPlayers.map((player) => (
                            <TableRow key={player.Id}>
                              <TableCell className="font-medium">{player.UserName}</TableCell>
                              <TableCell>{player.TeamName}</TableCell>
                              <TableCell className="text-center">{player.Games}</TableCell>
                              <TableCell className="text-center">{player.RunsScored}</TableCell>
                              <TableCell className="text-center">{calculateBattingAverage(player)}</TableCell>
                              <TableCell className="text-center">{calculateStrikeRate(player)}</TableCell>
                              <TableCell className="text-center">{player.Wickets}</TableCell>
                              <TableCell className="text-center">{calculateBowlingAverage(player)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-6">
                              No players found. Try adjusting your search or filters.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="batsmen" className="mt-0 pt-2">
                    <Table>
                      <TableHeader className="bg-muted/50 sticky top-0">
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort("UserName")}
                          >
                            Player {renderSortIcon("UserName")}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort("TeamName")}
                          >
                            Team {renderSortIcon("TeamName")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("Games")}
                          >
                            Games {renderSortIcon("Games")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("RunsScored")}
                          >
                            Runs {renderSortIcon("RunsScored")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("battingAverage")}
                          >
                            Avg {renderSortIcon("battingAverage")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("strikeRate")}
                          >
                            S/R {renderSortIcon("strikeRate")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("BallsFaced")}
                          >
                            Balls Faced {renderSortIcon("BallsFaced")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedPlayers.length > 0 ? (
                          sortedPlayers.map((player) => (
                            <TableRow key={player.Id}>
                              <TableCell className="font-medium">{player.UserName}</TableCell>
                              <TableCell>{player.TeamName}</TableCell>
                              <TableCell className="text-center">{player.Games}</TableCell>
                              <TableCell className="text-center">{player.RunsScored}</TableCell>
                              <TableCell className="text-center">{calculateBattingAverage(player)}</TableCell>
                              <TableCell className="text-center">{calculateStrikeRate(player)}</TableCell>
                              <TableCell className="text-center">{player.BallsFaced}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6">
                              No batsmen found. Try adjusting your search or filters.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="bowlers" className="mt-0 pt-2">
                    <Table>
                      <TableHeader className="bg-muted/50 sticky top-0">
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort("UserName")}
                          >
                            Player {renderSortIcon("UserName")}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort("TeamName")}
                          >
                            Team {renderSortIcon("TeamName")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("Games")}
                          >
                            Games {renderSortIcon("Games")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("Overs")}
                          >
                            Overs {renderSortIcon("Overs")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("Wickets")}
                          >
                            Wickets {renderSortIcon("Wickets")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("RunsConceded")}
                          >
                            Runs Conceded {renderSortIcon("RunsConceded")}
                          </TableHead>
                          <TableHead 
                            className="text-center cursor-pointer"
                            onClick={() => handleSort("bowlingAverage")}
                          >
                            Bowling Avg {renderSortIcon("bowlingAverage")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedPlayers.length > 0 ? (
                          sortedPlayers.map((player) => (
                            <TableRow key={player.Id}>
                              <TableCell className="font-medium">{player.UserName}</TableCell>
                              <TableCell>{player.TeamName}</TableCell>
                              <TableCell className="text-center">{player.Games}</TableCell>
                              <TableCell className="text-center">{player.Overs}</TableCell>
                              <TableCell className="text-center">{player.Wickets}</TableCell>
                              <TableCell className="text-center">{player.RunsConceded}</TableCell>
                              <TableCell className="text-center">{calculateBowlingAverage(player)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6">
                              No bowlers found. Try adjusting your search or filters.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </ScrollArea>
              </div>
            </Tabs>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Stats;
