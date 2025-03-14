
import React, { useEffect, useState } from 'react';
import MainLayout from "../components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { fetchFixtures } from '../services/cricketApi';
import { Fixture } from '../types/cricket';
import { Calendar, ArrowUpRight, Clock, Trophy, Filter, CalendarIcon } from "lucide-react";
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
import { toast } from 'sonner';
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { useIsMobile } from '@/hooks/use-mobile';
import { isToday, isFutureDate, formatDate } from '@/utils/dateFormatters';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Fixtures = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const isMobile = useIsMobile();
  const itemsPerPage = 10;

  useEffect(() => {
    const loadFixtures = async () => {
      setLoading(true);
      setError(null);
      try {
        const fixturesData = await fetchFixtures();
        console.log("Fixtures loaded in component:", fixturesData);
        
        if (fixturesData.length === 0) {
          toast.warning("No fixtures data available");
        }
        
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

  const filterByDate = (fixture: Fixture) => {
    if (dateFilter === "all") return true;
    
    if (dateFilter === "today") {
      return isToday(fixture.Date);
    }
    
    if (dateFilter === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const fixtureDate = new Date(fixture.Date);
      return fixtureDate.getDate() === tomorrow.getDate() &&
        fixtureDate.getMonth() === tomorrow.getMonth() &&
        fixtureDate.getFullYear() === tomorrow.getFullYear();
    }
    
    if (dateFilter === "thisWeek") {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      const fixtureDate = new Date(fixture.Date);
      return fixtureDate >= today && fixtureDate <= nextWeek;
    }
    
    if (dateFilter === "custom" && selectedDate) {
      const fixtureDate = new Date(fixture.Date);
      return fixtureDate.getDate() === selectedDate.getDate() &&
        fixtureDate.getMonth() === selectedDate.getMonth() &&
        fixtureDate.getFullYear() === selectedDate.getFullYear();
    }
    
    return true;
  };

  const filteredFixtures = fixtures
    .filter(filterBySearchTerm)
    .filter(filterByDate);
  
  const upcomingFixtures = filteredFixtures.filter(fixture => isFutureDate(fixture.Date));
  
  const completedFixtures = filteredFixtures.filter(fixture => 
    !isFutureDate(fixture.Date) && fixture.CompletionStatus === "Completed"
  );

  const allTabUpcomingFixtures = upcomingFixtures.slice(0, 5);
  const allTabCompletedFixtures = completedFixtures.slice(0, 5);

  const getFixturesForCurrentTab = () => {
    if (activeTab === 'upcoming') return upcomingFixtures;
    if (activeTab === 'completed') return completedFixtures;
    return [];
  };

  const paginatedFixtures = getFixturesForCurrentTab()
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.max(1, Math.ceil(getFixturesForCurrentTab().length / itemsPerPage));

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    console.log("Changed to tab:", value);
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    if (value !== "custom") {
      setSelectedDate(undefined);
    }
    setCurrentPage(1);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setDateFilter("custom");
    }
    setCurrentPage(1);
  };

  const emptyFixturesMessage = (
    <div className="py-8 text-center text-muted-foreground">
      No fixtures found
    </div>
  );

  const upcomingColumns = [
    {
      key: "Teams",
      header: "Teams",
      render: (_: any, row: Fixture) => (
        <div className="font-medium">
          {row.HomeTeam || 'TBD'} vs {row.AwayTeam || 'TBD'}
          {isToday(row.Date) && 
            <span className="ml-2 text-primary text-xs">Today</span>
          }
        </div>
      )
    },
    {
      key: "Venue",
      header: "Venue",
      hideOnMobile: true,
      render: (_: any, row: Fixture) => row.Venue || 'TBD'
    },
    {
      key: "DivisionName",
      header: "Division",
      hideOnMobile: true,
      render: (value: string) => value || 'N/A'
    },
    {
      key: "StartTime",
      header: "Time",
      className: "text-right",
      render: (value: string) => (
        <div className="flex items-center justify-end gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>{value || 'TBD'}</span>
        </div>
      )
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      render: (_: any, row: Fixture) => (
        <Link to={`/match/${row.Id}`} className="text-primary hover:text-primary/80 transition-colors">
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      )
    }
  ];

  const completedColumns = [
    {
      key: "Teams",
      header: "Teams",
      render: (_: any, row: Fixture) => (
        <div className="font-medium">
          <span className={row.HomeTeamWon ? "font-bold" : ""}>{row.HomeTeam || 'TBD'}</span>
          {" vs "}
          <span className={row.AwayTeamWon ? "font-bold" : ""}>{row.AwayTeam || 'TBD'}</span>
        </div>
      )
    },
    {
      key: "ScoreDescription",
      header: "Result",
      render: (value: string) => value || 'No result'
    },
    {
      key: "DivisionName",
      header: "Division",
      hideOnMobile: true,
      render: (value: string) => value || 'N/A'
    },
    {
      key: "Venue",
      header: "Venue",
      hideOnMobile: true,
      render: (value: string) => value || 'TBD'
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      render: (_: any, row: Fixture) => (
        <Link to={`/match/${row.Id}`} className="text-primary hover:text-primary/80 transition-colors">
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      )
    }
  ];

  return (
    <MainLayout>
      <ResponsiveContainer className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Fixtures & Results</h1>
          <div className="relative w-64">
            <Input
              placeholder="Search teams, venues..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pr-8"
            />
            <Filter className="absolute right-2 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <TabsList>
              <TabsTrigger value="all">All Fixtures</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Results</TabsTrigger>
            </TabsList>
            
            {activeTab !== 'all' && (
              <div className="flex items-center gap-2">
                <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="thisWeek">This week</SelectItem>
                    <SelectItem value="custom">Custom date</SelectItem>
                  </SelectContent>
                </Select>
                
                {dateFilter === "custom" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {selectedDate ? formatDate(selectedDate.toISOString()) : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}
          </div>
          
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
                        <ResponsiveTable
                          data={allTabUpcomingFixtures.map(fixture => ({
                            ...fixture,
                            Teams: `${fixture.HomeTeam} vs ${fixture.AwayTeam}`
                          }))}
                          columns={upcomingColumns}
                          keyField="Id"
                          superCompact={isMobile}
                        />
                      ) : (
                        emptyFixturesMessage
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
                
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
                        <ResponsiveTable
                          data={allTabCompletedFixtures.map(fixture => ({
                            ...fixture,
                            Teams: `${fixture.HomeTeam} vs ${fixture.AwayTeam}`
                          }))}
                          columns={completedColumns}
                          keyField="Id"
                          superCompact={isMobile}
                        />
                      ) : (
                        emptyFixturesMessage
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
                        <ResponsiveTable
                          data={paginatedFixtures.map(fixture => ({
                            ...fixture,
                            Teams: `${fixture.HomeTeam} vs ${fixture.AwayTeam}`
                          }))}
                          columns={upcomingColumns}
                          keyField="Id"
                          superCompact={isMobile}
                        />
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
                        <ResponsiveTable
                          data={paginatedFixtures.map(fixture => ({
                            ...fixture,
                            Teams: `${fixture.HomeTeam} vs ${fixture.AwayTeam}`
                          }))}
                          columns={completedColumns}
                          keyField="Id"
                          superCompact={isMobile}
                        />
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
                let pageToShow;
                if (totalPages <= 5) {
                  pageToShow = i + 1;
                } else if (currentPage <= 3) {
                  if (i < 4) {
                    pageToShow = i + 1;
                  } else {
                    pageToShow = totalPages;
                  }
                } else if (currentPage >= totalPages - 2) {
                  if (i === 0) {
                    pageToShow = 1;
                  } else {
                    pageToShow = totalPages - (4 - i);
                  }
                } else {
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
      </ResponsiveContainer>
    </MainLayout>
  );
};

export default Fixtures;
