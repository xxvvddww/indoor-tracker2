
import React, { useEffect, useState } from 'react';
import MainLayout from "../components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { fetchFixtures } from '../services/cricketApi';
import { Fixture } from '../types/cricket';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, ArrowUpRight, Clock } from "lucide-react";
import { Link } from 'react-router-dom';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const isToday = (dateString: string) => {
  const today = new Date();
  const date = new Date(dateString);
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const isFutureDate = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day
  const date = new Date(dateString);
  return date > today;
};

const Fixtures = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFixtures = async () => {
      setLoading(true);
      setError(null);
      try {
        const fixturesData = await fetchFixtures();
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

  // Split fixtures into upcoming and completed
  const upcomingFixtures = fixtures
    .filter(fixture => isFutureDate(fixture.Date))
    .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    
  const completedFixtures = fixtures
    .filter(fixture => !isFutureDate(fixture.Date) && fixture.CompletionStatus === "Completed")
    .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Fixtures & Results</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner size={8} />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            {error}
          </div>
        ) : fixtures.length === 0 ? (
          <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
            <Calendar className="mx-auto h-12 w-12 text-primary/50" />
            <h2 className="mt-4 text-xl font-medium">No Fixtures Available</h2>
            <p className="mt-2 text-muted-foreground">
              There are no fixtures available for the current season.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Fixtures */}
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Upcoming Fixtures</span>
                </h2>
              </div>
              
              {upcomingFixtures.length > 0 ? (
                <div className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Teams</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingFixtures.map((fixture) => (
                        <TableRow key={fixture.Id}>
                          <TableCell>
                            <div className="font-medium">
                              {isToday(fixture.Date) ? "Today" : formatDate(fixture.Date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{fixture.HomeTeam} vs {fixture.AwayTeam}</div>
                          </TableCell>
                          <TableCell>{fixture.Venue}</TableCell>
                          <TableCell>{fixture.DivisionName}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{fixture.StartTime}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link to={`/match/${fixture.Id}`} className="text-primary">
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No upcoming fixtures found
                </div>
              )}
            </div>
            
            {/* Completed Fixtures / Results */}
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Results</span>
                </h2>
              </div>
              
              {completedFixtures.length > 0 ? (
                <div className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Teams</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedFixtures.map((fixture) => (
                        <TableRow key={fixture.Id}>
                          <TableCell>
                            <div className="font-medium">
                              {formatDate(fixture.Date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{fixture.HomeTeam} vs {fixture.AwayTeam}</div>
                          </TableCell>
                          <TableCell>{fixture.ScoreDescription}</TableCell>
                          <TableCell>{fixture.DivisionName}</TableCell>
                          <TableCell>
                            <Link to={`/match/${fixture.Id}`} className="text-primary">
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Fixtures;
