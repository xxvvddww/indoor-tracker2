
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

const formatDate = (dateString: string) => {
  try {
    // Check if the date string is valid
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
    // Check if the date string is valid
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
    // Check if the date string is valid
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
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
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
        setFixtures(fixturesData);
      } catch (error) {
        console.error("Error loading fixtures:", error);
        setError("Failed to load fixtures. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    loadFixtures();
  }, []);

  // Filter fixtures
  const filterFixtures = (fixtures: Fixture[]) => {
    console.log("Filtering fixtures, current count:", fixtures.length);
    
    return fixtures.filter((fixture) => {
      // Convert all fields to strings before checking (to avoid undefined errors)
      const homeTeam = fixture.HomeTeam || "";
      const awayTeam = fixture.AwayTeam || "";
      const divisionName = fixture.DivisionName || "";
      const venue = fixture.Venue || "";
      
      const searchMatch = 
        homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        divisionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeTab === 'all') return searchMatch;
      if (activeTab === 'upcoming') return isFutureDate(fixture.Date) && searchMatch;
      if (activeTab === 'completed') {
        return !isFutureDate(fixture.Date) && 
               fixture.CompletionStatus === "Completed" && 
               searchMatch;
      }
      return searchMatch;
    });
  };
  
  const filteredFixtures = filterFixtures(fixtures);
  console.log("Filtered fixtures count:", filteredFixtures.length);
  
  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredFixtures.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFixtures = filteredFixtures.slice(startIndex, startIndex + itemsPerPage);
  console.log("Paginated fixtures count:", paginatedFixtures.length);
  
  // FIX: Prepare the fixtures for display and ensure they don't disappear
  const displayFixtures = paginatedFixtures;
  // For "all" tab, we need to separately prepare upcoming and completed fixtures from displayFixtures
  const upcomingFixtures = activeTab === 'all' 
    ? displayFixtures.filter(fixture => isFutureDate(fixture.Date))
    : displayFixtures;
    
  const completedFixtures = activeTab === 'all' 
    ? displayFixtures.filter(fixture => !isFutureDate(fixture.Date) && fixture.CompletionStatus === "Completed")
    : [];

  console.log("Upcoming fixtures:", upcomingFixtures.length);
  console.log("Completed fixtures:", completedFixtures.length);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  // DEBUG: Add more logging to see when/why fixtures disappear
  useEffect(() => {
    console.log("Tab changed or filters updated:", {
      activeTab, 
      filteredCount: filteredFixtures.length,
      displayCount: displayFixtures.length,
      upcomingCount: upcomingFixtures.length, 
      completedCount: completedFixtures.length
    });
  }, [activeTab, filteredFixtures.length, displayFixtures.length, upcomingFixtures.length, completedFixtures.length]);

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
        
        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => {
          setActiveTab(value);
          setCurrentPage(1); // Reset to first page when changing tabs
        }}>
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
          ) : filteredFixtures.length === 0 ? (
            <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
              <Calendar className="mx-auto h-12 w-12 text-primary/50" />
              <h2 className="mt-4 text-xl font-medium">No Fixtures Found</h2>
              <p className="mt-2 text-muted-foreground">
                {searchTerm ? "No fixtures match your search criteria." : "There are no fixtures available for the current season."}
              </p>
            </div>
          ) : (
            <>
              <TabsContent value="all" className="space-y-8">
                {/* FIX: Don't check length here, as that's what's causing the disappearing content */}
                {/* Upcoming Fixtures - Always show section if we're in "All" tab */}
                <div className="bg-card rounded-lg border shadow-sm">
                  <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Upcoming Fixtures</span>
                    </h2>
                  </div>
                  
                  <ScrollArea className="h-full max-h-[400px]">
                    <div className="p-4">
                      {upcomingFixtures.length > 0 ? (
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
                            {upcomingFixtures.map((fixture) => (
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
                    </div>
                  </ScrollArea>
                </div>
                
                {/* Completed Fixtures / Results - Always show section if we're in "All" tab */}
                <div className="bg-card rounded-lg border shadow-sm">
                  <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>Results</span>
                    </h2>
                  </div>
                  
                  <ScrollArea className="h-full max-h-[400px]">
                    <div className="p-4">
                      {completedFixtures.length > 0 ? (
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
                            {completedFixtures.map((fixture) => (
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
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
              
              <TabsContent value="upcoming">
                <div className="bg-card rounded-lg border shadow-sm">
                  <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Upcoming Fixtures</span>
                    </h2>
                  </div>
                  
                  <ScrollArea className="h-full max-h-[600px]">
                    <div className="p-4">
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
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
              
              <TabsContent value="completed">
                <div className="bg-card rounded-lg border shadow-sm">
                  <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>Results</span>
                    </h2>
                  </div>
                  
                  <ScrollArea className="h-full max-h-[600px]">
                    <div className="p-4">
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
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
        
        {!loading && filteredFixtures.length > 0 && totalPages > 1 && (
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
