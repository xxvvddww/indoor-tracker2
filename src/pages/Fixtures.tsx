
import React, { useEffect, useState } from 'react';
import MainLayout from "../components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { fetchFixtures } from '../services/cricketApi';
import { Fixture } from '../types/cricket';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDate } from '@/utils/dateFormatters';
import { FixturesSearch } from '@/components/fixtures/FixturesSearch';
import { FixturesPagination } from '@/components/fixtures/FixturesPagination';
import { FixturesDateSection } from '@/components/fixtures/FixturesDateSection';
import { filterBySearchTerm, getFixturesByDivision, sortDivisions } from '@/components/fixtures/FixturesUtils';

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

  const filteredFixtures = fixtures.filter(fixture => filterBySearchTerm(fixture, searchTerm));
  
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

  useEffect(() => {
    if (paginatedDates.length > 0 && Object.keys(openDateSections).length === 0) {
      const initialOpenState: Record<string, boolean> = {};
      paginatedDates.forEach((date) => {
        initialOpenState[date] = false;
      });
      setOpenDateSections(initialOpenState);
    }
  }, [paginatedDates]);

  useEffect(() => {
    const initialDivisionState: Record<string, boolean> = {};
    
    paginatedDates.forEach(date => {
      const dateFixtures = fixturesByDate[date];
      const fixturesByDivision = getFixturesByDivision(dateFixtures);
      const divisions = Object.keys(fixturesByDivision);
      
      divisions.forEach(division => {
        const divisionKey = `${date}-${division}`;
        initialDivisionState[divisionKey] = false;
      });
    });
    
    if (Object.keys(openDivisionSections).length === 0) {
      setOpenDivisionSections(initialDivisionState);
    }
  }, [paginatedDates, fixturesByDate]);

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

  const resetState = () => {
    setCurrentPage(1);
    setOpenDateSections({});
    setOpenDivisionSections({});
  };

  return (
    <MainLayout>
      <ResponsiveContainer className="space-y-2 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold tracking-tight">Results</h1>
          <FixturesSearch 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            resetState={resetState}
          />
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
                          <FixturesDateSection
                            key={date}
                            date={date}
                            dateFixtures={dateFixtures}
                            fixturesByDivision={fixturesByDivision}
                            sortedDivisions={sortedDivisions}
                            openDateSections={openDateSections}
                            openDivisionSections={openDivisionSections}
                            toggleDateSection={toggleDateSection}
                            toggleDivisionSection={toggleDivisionSection}
                          />
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
            
            <FixturesPagination
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </>
        )}
      </ResponsiveContainer>
    </MainLayout>
  );
};

export default Fixtures;
