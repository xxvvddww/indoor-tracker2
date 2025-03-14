
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from 'lucide-react';
import { Team } from '@/types/cricket';
import TeamDivisionTable from './TeamDivisionTable';
import { useIsMobile } from '@/hooks/use-mobile';

interface TeamDivisionListProps {
  sortedDivisions: [string, Team[]][];
  hasError: boolean;
  openDivisions: Record<string, boolean>;
}

const TeamDivisionList = ({ 
  sortedDivisions, 
  hasError,
  openDivisions
}: TeamDivisionListProps) => {
  const isMobile = useIsMobile();
  const compactMode = isMobile;

  return (
    <Card className={compactMode ? 'p-0 border-0 shadow-none' : ''}>
      {!compactMode && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Team Rankings</span>
          </CardTitle>
          <CardDescription>
            {hasError ? 
              "Sample data for demonstration purposes" : 
              "Team performance statistics for the current season"}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={compactMode ? 'p-0' : ''}>
        <div className={`space-y-${compactMode ? '1' : '6'}`}>
          {sortedDivisions.map(([division, divisionTeams]) => (
            <TeamDivisionTable
              key={division}
              divisionName={division}
              teams={divisionTeams}
              initialOpen={openDivisions[division] || false}
              preserveOpenState={true}
            />
          ))}
        </div>
      </CardContent>
      {!compactMode && (
        <CardFooter className="text-sm text-muted-foreground">
          Statistics based on completed matches | Win% = Wins ÷ Games × 100
        </CardFooter>
      )}
    </Card>
  );
};

export default TeamDivisionList;
