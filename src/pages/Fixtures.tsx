
import React, { useEffect, useState } from 'react';
import MainLayout from "../components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { fetchFixtures } from '../services/cricketApi';
import { Fixture } from '../types/cricket';
import { ArrowUpRight, Calendar, ChevronDown, ChevronUp } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDate } from '@/utils/dateFormatters';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Fixtures = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openDateSections, setOpenDateSections] = useState<Record<string, boolean>>({});
  const [openDivisionSections, setOpenDivisionSections] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();
  const itemsPerPage = 20;

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

  const filteredFixtures = fixtures.filter(filterBySearchTerm);
  
  // Group completed fixtures by date and division
  const fixturesByDateAndDivision = filteredFixtures
    .filter(fixture => fixture.CompletionStatus === "Completed")
    .reduce((acc, fixture) => {
      const fixtureDate = formatDate(fixture.Date);
      const division = fixture.DivisionName || "Unknown Division";
      
      if (!acc[fixtureDate]) {
        acc[fixtureDate] = {};
      }
      
      if (!acc[fixtureDate][division]) {
        acc[fixtureDate][division] = [];
      }
      
      acc[fixtureDate][division].push(fixture);
      return acc;
    }, {} as Record<string, Record<string, Fixture[]>>);

  // Get sorted dates (most recent first)
  const sortedDates = Object.keys(fixturesByDateAndDivision).sort((a, b) => {
    const dateA = new Date(fixturesByDateAndDivision[a][Object.keys(fixturesByDateAndDivision[a])[0]][0].Date);
    const dateB = new Date(fixturesByDateAndDivision[b][Object.keys(fixturesByDateAndDivision[b])[0]][0].Date);
    return dateB.getTime() - dateA.getTime();
  });

  // Paginate the dates
  const paginatedDates = sortedDates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(sortedDates.length / itemsPerPage));

  // Initialize open state for date sections
  useEffect(() => {
    if (paginatedDates.length > 0 && Object.keys(openDateSections).length === 0) {
      const initialOpenState: Record<string, boolean> = {};
      paginatedDates.forEach((date, index) => {
        initialOpenState[date] = index === 0; // Open only the first section by default
      });
      setOpenDateSections(initialOpenState);
    }
  }, [paginatedDates]);

  const toggleDateSection = (date: string) => {
    setOpenDateSections(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const toggleDivisionSection = (key: string) => {
    setOpenDivisionSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setOpenDateSections({}); // Reset open sections when changing page
    setOpenDivisionSections({}); // Reset open division sections as well
    window.scrollTo(0, 0);
  };

  // Custom match display using JSX instead of ResponsiveTable
  const renderMatch = (fixture: Fixture) => {
    return (
      <div key={fixture.Id} className="flex justify-between items-center py-1.5 border-b border-gray-800 last:border-0">
        <div className="flex-1 flex items-center">
          <span className={cn(
            "team-name",
            fixture.HomeTeamWon && "team-name-winner"
          )}>
            {fixture.HomeTeam || 'TBD'}
          </span>
        </div>
        <div className="flex-none px-1 text-[0.65rem] text-muted-foreground">vs</div>
        <div className="flex-1 flex items-center">
          <span className={cn(
            "team-name",
            fixture.AwayTeamWon && "team-name-winner"
          )}>
            {fixture.AwayTeam || 'TBD'}
          </span>
        </div>
        <div className="flex-none flex items-center justify-end">
          <span className="score-display">
            {fixture.ScoreDescription || `${fixture.HomeTeamScore}-${fixture.AwayTeamScore}`}
          </span>
          <Link to={`/match/${fixture.Id}`} className="text-primary ml-0.5">
            <ArrowUpRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <ResponsiveContainer className="space-y-2 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold tracking-tight">Results</h1>
          <div className="relative w-28 sm:w-64">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                setOpenDateSections({});
                setOpenDivisionSections({});
              }}
              className="pr-8 h-7 text-xs"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner size={6} />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
            {error}
          </div>
        ) : (
          <>
            <Card className="dark-results-container">
              <CardHeader className="pb-0.5 pt-2 px-4 dark-results-header">
                <CardTitle className="flex items-center gap-1 text-base">
                  Results by Date
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-full max-h-[500px]">
                  {paginatedDates.length > 0 ? (
                    <div className="space-y-1 p-2">
                      {paginatedDates.map(date => (
                        <Collapsible 
                          key={date}
                          open={!!openDateSections[date]}
                          onOpenChange={() => toggleDateSection(date)}
                          className="border border-gray-800 rounded-md overflow-hidden"
                        >
                          <CollapsibleTrigger className="w-full flex justify-between items-center p-1.5 dark-results-date">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 text-primary mr-1.5" />
                              <span className="font-semibold text-xs">{date}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-[0.65rem] text-muted-foreground mr-1">
                                {Object.values(fixturesByDateAndDivision[date]).flat().length} {Object.values(fixturesByDateAndDivision[date]).flat().length === 1 ? 'match' : 'matches'}
                              </span>
                              {openDateSections[date] ? (
                                <ChevronUp className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-0">
                            <div className="p-0">
                              {Object.keys(fixturesByDateAndDivision[date]).sort().map((division, i) => {
                                const sectionKey = `${date}-${division}`;
                                return (
                                  <div key={sectionKey} className="division-section">
                                    <Collapsible
                                      open={openDivisionSections[sectionKey] !== false} // Default to open
                                      onOpenChange={() => toggleDivisionSection(sectionKey)}
                                    >
                                      <CollapsibleTrigger className="w-full text-left division-header">
                                        <span>{division}</span>
                                        {openDivisionSections[sectionKey] === false ? (
                                          <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                                        ) : (
                                          <ChevronUp className="h-2.5 w-2.5 text-muted-foreground" />
                                        )}
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <div className="px-2">
                                          {fixturesByDateAndDivision[date][division].map(renderMatch)}
                                        </div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-muted-foreground text-sm">
                      No results found
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            
            {sortedDates.length > itemsPerPage && (
              <Pagination className="mt-2">
                <PaginationContent className="h-6">
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} h-5 w-5 p-0 flex items-center justify-center`} 
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageToShow;
                    if (totalPages <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 2) {
                      if (i < 2) {
                        pageToShow = i + 1;
                      } else {
                        pageToShow = totalPages;
                      }
                    } else if (currentPage >= totalPages - 1) {
                      if (i === 0) {
                        pageToShow = 1;
                      } else {
                        pageToShow = totalPages - (2 - i);
                      }
                    } else {
                      if (i === 0) {
                        pageToShow = 1;
                      } else if (i === 2) {
                        pageToShow = totalPages;
                      } else {
                        pageToShow = currentPage;
                      }
                    }
                    
                    return (
                      <PaginationItem key={pageToShow}>
                        <PaginationLink
                          isActive={currentPage === pageToShow}
                          onClick={() => handlePageChange(pageToShow)}
                          className="cursor-pointer h-5 w-5 p-0 flex items-center justify-center text-[0.65rem]"
                        >
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} h-5 w-5 p-0 flex items-center justify-center`} 
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </ResponsiveContainer>
    </MainLayout>
  );
};

export default Fixtures;
