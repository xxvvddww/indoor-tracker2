
import React, { useState, useEffect } from 'react';
import MainLayout from "../components/layout/MainLayout";
import { fetchPlayerStats, DEFAULT_LEAGUE_ID, CURRENT_SEASON_ID } from "../services/cricketApi";
import { Player } from "../types/cricket";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Search } from "lucide-react";

const Stats = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  
  const playersPerPage = 15;

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

  // Filter players by search term and active tab
  const filteredPlayers = players.filter(player => {
    const matchesSearch = 
      player.UserName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      player.TeamName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "batsmen") return matchesSearch && parseInt(player.RunsScored) > 0;
    if (activeTab === "bowlers") return matchesSearch && parseInt(player.Wickets) > 0;
    
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * playersPerPage,
    currentPage * playersPerPage
  );

  // Table sort helpers
  const sortByRuns = (playersToSort: Player[]) => {
    return [...playersToSort].sort((a, b) => parseInt(b.RunsScored) - parseInt(a.RunsScored));
  };

  const sortByWickets = (playersToSort: Player[]) => {
    return [...playersToSort].sort((a, b) => parseInt(b.Wickets) - parseInt(a.Wickets));
  };

  // Calculate batting average (runs / times out)
  const getBattingAverage = (player: Player) => {
    const runsScored = parseInt(player.RunsScored);
    const timesOut = parseInt(player.TimesOut);
    
    if (timesOut === 0) return runsScored > 0 ? "∞" : "0.00";
    
    const average = runsScored / timesOut;
    return average.toFixed(2);
  };

  // Calculate bowling average (runs conceded / wickets)
  const getBowlingAverage = (player: Player) => {
    const runsConceded = parseInt(player.RunsConceded);
    const wickets = parseInt(player.Wickets);
    
    if (wickets === 0) return "N/A";
    
    const average = runsConceded / wickets;
    return average.toFixed(2);
  };

  // Calculate batting strike rate (runs / balls faced * 100)
  const getStrikeRate = (player: Player) => {
    const runsScored = parseInt(player.RunsScored);
    const ballsFaced = parseInt(player.BallsFaced);
    
    if (ballsFaced === 0) return "0.00";
    
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
        
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search players or teams..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            
            <Tabs 
              defaultValue="all" 
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value);
                setCurrentPage(1); // Reset to first page on tab change
              }}
              className="w-full md:w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All Players</TabsTrigger>
                <TabsTrigger value="batsmen">Batsmen</TabsTrigger>
                <TabsTrigger value="bowlers">Bowlers</TabsTrigger>
              </TabsList>
              
              <div className="p-0">
                <div className="overflow-x-auto">
                  <TabsContent value="all" className="mt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-right">Games</TableHead>
                          <TableHead className="text-right">Runs</TableHead>
                          <TableHead className="text-right">Avg</TableHead>
                          <TableHead className="text-right">S/R</TableHead>
                          <TableHead className="text-right">Wickets</TableHead>
                          <TableHead className="text-right">Bowling Avg</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedPlayers.length > 0 ? (
                          paginatedPlayers.map((player) => (
                            <TableRow key={player.Id}>
                              <TableCell className="font-medium">{player.UserName}</TableCell>
                              <TableCell>{player.TeamName}</TableCell>
                              <TableCell className="text-right">{player.Games}</TableCell>
                              <TableCell className="text-right">{player.RunsScored}</TableCell>
                              <TableCell className="text-right">{getBattingAverage(player)}</TableCell>
                              <TableCell className="text-right">{getStrikeRate(player)}</TableCell>
                              <TableCell className="text-right">{player.Wickets}</TableCell>
                              <TableCell className="text-right">{getBowlingAverage(player)}</TableCell>
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

                  <TabsContent value="batsmen" className="mt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-right">Games</TableHead>
                          <TableHead className="text-right">Runs</TableHead>
                          <TableHead className="text-right">Avg</TableHead>
                          <TableHead className="text-right">S/R</TableHead>
                          <TableHead className="text-right">Balls Faced</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortByRuns(paginatedPlayers).length > 0 ? (
                          sortByRuns(paginatedPlayers).map((player) => (
                            <TableRow key={player.Id}>
                              <TableCell className="font-medium">{player.UserName}</TableCell>
                              <TableCell>{player.TeamName}</TableCell>
                              <TableCell className="text-right">{player.Games}</TableCell>
                              <TableCell className="text-right">{player.RunsScored}</TableCell>
                              <TableCell className="text-right">{getBattingAverage(player)}</TableCell>
                              <TableCell className="text-right">{getStrikeRate(player)}</TableCell>
                              <TableCell className="text-right">{player.BallsFaced}</TableCell>
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

                  <TabsContent value="bowlers" className="mt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-right">Games</TableHead>
                          <TableHead className="text-right">Overs</TableHead>
                          <TableHead className="text-right">Wickets</TableHead>
                          <TableHead className="text-right">Runs Conceded</TableHead>
                          <TableHead className="text-right">Bowling Avg</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortByWickets(paginatedPlayers).length > 0 ? (
                          sortByWickets(paginatedPlayers).map((player) => (
                            <TableRow key={player.Id}>
                              <TableCell className="font-medium">{player.UserName}</TableCell>
                              <TableCell>{player.TeamName}</TableCell>
                              <TableCell className="text-right">{player.Games}</TableCell>
                              <TableCell className="text-right">{player.Overs}</TableCell>
                              <TableCell className="text-right">{player.Wickets}</TableCell>
                              <TableCell className="text-right">{player.RunsConceded}</TableCell>
                              <TableCell className="text-right">{getBowlingAverage(player)}</TableCell>
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
                </div>
              </div>
            </Tabs>
          </div>
          
          {filteredPlayers.length > playersPerPage && (
            <div className="border-t p-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Show pages around current page
                    let pageToShow;
                    if (totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i;
                    } else {
                      pageToShow = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageToShow}>
                        <PaginationLink
                          isActive={currentPage === pageToShow}
                          onClick={() => setCurrentPage(pageToShow)}
                        >
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Stats;
