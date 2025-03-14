
import React, { useEffect, useState } from 'react';
import MainLayout from "../components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { fetchFixtures } from '../services/cricketApi';
import { Fixture } from '../types/cricket';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, ArrowUpRight, Clock, Trophy, Filter } from "lucide-react";
import { Link } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatDate = (dateString: string) => {
  try {
    if (!dateString || dateString === "" || isNaN(Date.parse(dateString))) {
      return "Date unavailable";
    }
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-AU', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Date unavailable";
  }
};

const isToday = (dateString: string) => {
  try {
    if (!dateString || dateString === "" || isNaN(Date.parse(dateString))) {
      return false;
    }
    
    const today = new Date();
    const date = new Date(dateString);
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  } catch (error) {
    console.error("Error checking if date is today:", dateString, error);
    return false;
  }
};

const isFutureDate = (dateString: string) => {
  try {
    if (!dateString || dateString === "" || isNaN(Date.parse(dateString))) {
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    const date = new Date(dateString);
    return date > today;
  } catch (error) {
    console.error("Error checking if date is in future:", dateString, error);
    return false;
  }
};

const Fixtures = () => {
  const [allFixtures, setAllFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('all');
  const itemsPerPage = 10;

  useEffect(() => {
    const loadFixtures = async () => {
      setLoading(true);
      setError(null);
      try {
        const fixturesData = await fetchFixtures();
        console.log("Fixtures loaded in component:", fixturesData);
        setAllFixtures(fixturesData);
      } catch (error) {
        console.error("Error loading fixtures:", error);
        setError("Failed to load fixtures. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    loadFixtures();
  }, []);

  // Filter by search term
  const filterBySearchTerm = (fixture: Fixture) => {
    if (!searchTerm) return true;
    
    const homeTeam = fixture.HomeTeam || "";
    const awayTeam = fixture.AwayTeam || "";
    const divisionName = fixture.DivisionName || "";
    const venue = fixture.Venue || "";
    
    return homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      divisionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // Upcoming fixtures (future dates)
  const upcomingFixtures = allFixtures
    .filter(fixture => isFutureDate(fixture.Date))
    .filter(filterBySearchTerm);
  
  // Completed fixtures (past dates with completion status)
  const completedFixtures = allFixtures
    .filter(fixture => !isFutureDate(fixture.Date) && fixture.CompletionStatus === "Completed")
    .filter(filterBySearchTerm);

  // For "all" tab, we show a limited number of each type
  const allTabUpcomingFixtures = upcomingFixtures.slice(0, 5);
  const allTabCompletedFixtures = completedFixtures.slice(0, 5);

  // For pagination in the dedicated tabs
  const getFixturesForCurrentTab = () => {
    if (activeTab === 'upcoming') return upcomingFixtures;
    if (activeTab === 'completed') return completedFixtures;
    return [];
  };

  const paginatedFixtures = getFixturesForCurrentTab()
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.max(1, Math.ceil(getFixturesForCurrentTab().length / itemsPerPage));

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  // For tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
    console.log("Changed to tab:", value);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Fixtures & Results</h1>
          <div className="relative w-64">
            <Input
              placeholder="Search teams, venues..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="pr-8"
            />
            <Filter className="absolute right-2 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Fixtures</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Results</TabsTrigger>
          </TabsList>
          
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <LoadingSpinner size={8} />
            </div>
          ) : error ? (
            <div className="bg-destructive/10 p-4 rounded-md text-destructive">
              {error}
            </div>
          ) : (
            <>
              <TabsContent value="all" className="space-y-8">
                {/* Upcoming Fixtures Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-4 w-4" />
                      Upcoming Fixtures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-full max-h-[400px]">
                      {allTabUpcomingFixtures.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Teams</TableHead>
                              <TableHead className="hidden md:table-cell">Venue</TableHead>
                              <TableHead className="hidden md:table-cell">Division</TableHead>
                              <TableHead className="text-right">Time</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allTabUpcomingFixtures.map((fixture) => (
                              <TableRow key={fixture.Id} className="hover:bg-muted/50">
                                <TableCell>
                                  <div className="font-medium">
                                    {isToday(fixture.Date) ? 
                                      <span className="text-primary">Today</span> : 
                                      formatDate(fixture.Date)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{fixture.HomeTeam || 'TBD'} vs {fixture.AwayTeam || 'TBD'}</div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{fixture.Venue || 'TBD'}</TableCell>
                                <TableCell className="hidden md:table-cell">{fixture.DivisionName || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span>{fixture.StartTime || 'TBD'}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Link to={`/match/${fixture.Id}`} className="text-primary hover:text-primary/80 transition-colors">
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          No upcoming fixtures found
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                {/* Completed Fixtures / Results */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Trophy className="h-4 w-4" />
                      Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-full max-h-[400px]">
                      {allTabCompletedFixtures.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Teams</TableHead>
                              <TableHead>Result</TableHead>
                              <TableHead className="hidden md:table-cell">Division</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allTabCompletedFixtures.map((fixture) => (
                              <TableRow key={fixture.Id} className="hover:bg-muted/50">
                                <TableCell>
                                  <div className="font-medium">
                                    {formatDate(fixture.Date)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    <span className={fixture.HomeTeamWon ? "font-bold" : ""}>{fixture.HomeTeam || 'TBD'}</span>
                                    {" vs "}
                                    <span className={fixture.AwayTeamWon ? "font-bold" : ""}>{fixture.AwayTeam || 'TBD'}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{fixture.ScoreDescription || 'No result'}</TableCell>
                                <TableCell className="hidden md:table-cell">{fixture.DivisionName || 'N/A'}</TableCell>
                                <TableCell>
                                  <Link to={`/match/${fixture.Id}`} className="text-primary hover:text-primary/80 transition-colors">
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          No completed fixtures found
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="upcoming">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-4 w-4" />
                      Upcoming Fixtures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-full max-h-[600px]">
                      {paginatedFixtures.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Teams</TableHead>
                              <TableHead className="hidden md:table-cell">Venue</TableHead>
                              <TableHead className="hidden md:table-cell">Division</TableHead>
                              <TableHead className="text-right">Time</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedFixtures.map((fixture) => (
                              <TableRow key={fixture.Id} className="hover:bg-muted/50">
                                <TableCell>
                                  <div className="font-medium">
                                    {isToday(fixture.Date) ? 
                                      <span className="text-primary">Today</span> : 
                                      formatDate(fixture.Date)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{fixture.HomeTeam || 'TBD'} vs {fixture.AwayTeam || 'TBD'}</div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{fixture.Venue || 'TBD'}</TableCell>
                                <TableCell className="hidden md:table-cell">{fixture.DivisionName || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span>{fixture.StartTime || 'TBD'}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Link to={`/match/${fixture.Id}`} className="text-primary hover:text-primary/80 transition-colors">
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          No upcoming fixtures found
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="completed">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Trophy className="h-4 w-4" />
                      Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-full max-h-[600px]">
                      {paginatedFixtures.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Teams</TableHead>
                              <TableHead>Result</TableHead>
                              <TableHead className="hidden md:table-cell">Division</TableHead>
                              <TableHead className="hidden md:table-cell">Venue</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedFixtures.map((fixture) => (
                              <TableRow key={fixture.Id} className="hover:bg-muted/50">
                                <TableCell>
                                  <div className="font-medium">
                                    {formatDate(fixture.Date)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    <span className={fixture.HomeTeamWon ? "font-bold" : ""}>{fixture.HomeTeam || 'TBD'}</span>
                                    {" vs "}
                                    <span className={fixture.AwayTeamWon ? "font-bold" : ""}>{fixture.AwayTeam || 'TBD'}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{fixture.ScoreDescription || 'No result'}</TableCell>
                                <TableCell className="hidden md:table-cell">{fixture.DivisionName || 'N/A'}</TableCell>
                                <TableCell className="hidden md:table-cell">{fixture.Venue || 'TBD'}</TableCell>
                                <TableCell>
                                  <Link to={`/match/${fixture.Id}`} className="text-primary hover:text-primary/80 transition-colors">
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          No results found
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
        
        {!loading && getFixturesForCurrentTab().length > itemsPerPage && activeTab !== 'all' && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show first page, last page, current page, and 1 page before and after current
                let pageToShow;
                if (totalPages <= 5) {
                  // Show all pages if 5 or fewer
                  pageToShow = i + 1;
                } else if (currentPage <= 3) {
                  // Near the beginning
                  if (i < 4) {
                    pageToShow = i + 1;
                  } else {
                    pageToShow = totalPages;
                  }
                } else if (currentPage >= totalPages - 2) {
                  // Near the end
                  if (i === 0) {
                    pageToShow = 1;
                  } else {
                    pageToShow = totalPages - (4 - i);
                  }
                } else {
                  // In the middle
                  if (i === 0) {
                    pageToShow = 1;
                  } else if (i === 4) {
                    pageToShow = totalPages;
                  } else {
                    pageToShow = currentPage + (i - 2);
                  }
                }
                
                return (
                  <PaginationItem key={pageToShow}>
                    <PaginationLink
                      isActive={currentPage === pageToShow}
                      onClick={() => handlePageChange(pageToShow)}
                      className="cursor-pointer"
                    >
                      {pageToShow}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </MainLayout>
  );
};

export default Fixtures;
