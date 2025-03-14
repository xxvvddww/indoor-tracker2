import React, { useEffect, useState } from 'react';
import MainLayout from "../components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { fetchFixtures } from '../services/cricketApi';
import { Fixture } from '../types/cricket';
import { ArrowUpRight, Filter, Calendar, Shield } from "lucide-react";
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
  
  const fixturesByDate = filteredFixtures
    .filter(fixture => fixture.CompletionStatus === "Completed")
    .reduce((acc, fixture) => {
      const fixtureDate = formatDate(fixture.Date);
      if (!acc[fixtureDate]) {
        acc[fixtureDate] = [];
      }
      acc[fixtureDate].push(fixture);
      return acc;
    }, {} as Record<string, Fixture[]>);

  const sortedDates = Object.keys(fixturesByDate).sort((a, b) => {
    const dateA = new Date(fixturesByDate[a][0].Date);
    const dateB = new Date(fixturesByDate[b][0].Date);
    return dateB.getTime() - dateA.getTime();
  });

  const paginatedDates = sortedDates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(sortedDates.length / itemsPerPage));

  const sortDivisions = (divisionNames: string[]): string[] => {
    const divisionMap: Record<string, number> = {};
    const nonNumberedDivisions: string[] = [];
    
    divisionNames.forEach(div => {
      if (div.startsWith("Division") || div.startsWith("Div")) {
        let divNumber = 0;
        if (div.startsWith("Division")) {
          divNumber = parseInt(div.replace("Division", "").trim());
        } else if (div.startsWith("Div")) {
          divNumber = parseInt(div.replace("Div", "").trim());
        }
        
        if (!isNaN(divNumber)) {
          divisionMap[div] = divNumber;
        } else {
          nonNumberedDivisions.push(div);
        }
      } else {
        nonNumberedDivisions.push(div);
      }
    });
    
    const numberedDivisions = Object.entries(divisionMap)
      .sort((a, b) => a[1] - b[1])
      .map(entry => entry[0]);
    
    nonNumberedDivisions.sort();
    
    return [...numberedDivisions, ...nonNumberedDivisions];
  };

  const getFixturesByDivision = (dateFixtures: Fixture[]) => {
    const divisionMap = dateFixtures.reduce((acc, fixture) => {
      const divisionName = fixture.DivisionName || 'No Division';
      if (!acc[divisionName]) {
        acc[divisionName] = [];
      }
      acc[divisionName].push(fixture);
      return acc;
    }, {} as Record<string, Fixture[]>);
    
    return divisionMap;
  };

  useEffect(() => {
    if (paginatedDates.length > 0 && Object.keys(openDateSections).length === 0) {
      const initialOpenState: Record<string, boolean> = {};
      paginatedDates.forEach((date, index) => {
        initialOpenState[date] = index === 0;
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

  const toggleDivisionSection = (divisionKey: string) => {
    setOpenDivisionSections(prev => ({
      ...prev,
      [divisionKey]: !prev[divisionKey]
    }));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setOpenDateSections({});
    setOpenDivisionSections({});
    window.scrollTo(0, 0);
  };

  const renderFixtureRow = (fixture: Fixture) => {
    return (
      <tr key={fixture.Id} className="border-b border-gray-800 last:border-0">
        <td className="py-1.5 px-1 text-left w-1/3">
          <span className={cn(
            "team-name",
            fixture.HomeTeamWon && "team-winner"
          )}>
            {fixture.HomeTeam || 'TBD'}
          </span>
        </td>
        <td className="py-1.5 px-0 text-center w-6">
          <span className="vs-text">vs</span>
        </td>
        <td className="py-1.5 px-1 text-left w-1/3">
          <span className={cn(
            "team-name",
            fixture.AwayTeamWon && "team-winner"
          )}>
            {fixture.AwayTeam || 'TBD'}
          </span>
        </td>
        <td className="py-1.5 px-1 text-right w-16">
          <div className="flex items-center justify-end gap-0.5">
            <span className="score-display">
              {fixture.HomeTeamScore}-{fixture.AwayTeamScore}
            </span>
            <Link to={`/match/${fixture.Id}`} className="text-primary ml-0.5">
              <ArrowUpRight className="h-2.5 w-2.5" />
            </Link>
          </div>
        </td>
      </tr>
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
            <Filter className="absolute right-2 top-1.5 h-3 w-3 text-muted-foreground" />
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
            <Card className="border border-gray-700 bg-background/30">
              <CardHeader className="pb-0.5 pt-1.5 px-2">
                <CardTitle className="flex items-center gap-1 text-xs">
                  Results by Date
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-full max-h-[500px]">
                  {paginatedDates.length > 0 ? (
                    <div className="space-y-1 px-1 py-1">
                      {paginatedDates.map(date => {
                        const dateFixtures = fixturesByDate[date];
                        const fixturesByDivision = getFixturesByDivision(dateFixtures);
                        const sortedDivisions = sortDivisions(Object.keys(fixturesByDivision));
                        
                        return (
                          <Collapsible 
                            key={date}
                            open={!!openDateSections[date]}
                            onOpenChange={() => toggleDateSection(date)}
                            className="date-section"
                          >
                            <CollapsibleTrigger className="date-header w-full">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 text-primary mr-1.5" />
                                <span className="font-semibold text-xs">{date}</span>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="space-y-0.5 py-1">
                                {sortedDivisions.map(division => {
                                  const divisionKey = `${date}-${division}`;
                                  const isOpen = openDivisionSections[divisionKey] !== false;
                                  const divisionText = division.startsWith("Division") 
                                    ? `Div ${division.replace("Division", "").trim()}`
                                    : division;
                                  
                                  return (
                                    <Collapsible 
                                      key={divisionKey}
                                      open={isOpen}
                                      onOpenChange={() => toggleDivisionSection(divisionKey)}
                                      className="division-section"
                                    >
                                      <CollapsibleTrigger className="division-header w-full">
                                        <div className="flex items-center">
                                          <Shield className="h-2.5 w-2.5 text-primary mr-1" />
                                          <span className="font-medium text-[0.7rem]">{divisionText}</span>
                                        </div>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <table className="results-table">
                                          <tbody>
                                            {fixturesByDivision[division].map(fixture => renderFixtureRow(fixture))}
                                          </tbody>
                                        </table>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
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
