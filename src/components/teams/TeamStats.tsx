
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, Trophy } from 'lucide-react';
import LoadingSpinner from '../ui/loading-spinner';
import { Team } from '@/types/cricket';
import { useIsMobile } from '@/hooks/use-mobile';

interface TeamStatsProps {
  isLoading: boolean;
  totalTeams: number;
  uniqueDivisions: number;
  displayTeams: Team[];
}

const TeamStats = ({ isLoading, totalTeams, uniqueDivisions, displayTeams }: TeamStatsProps) => {
  const isMobile = useIsMobile();
  const compactMode = isMobile;

  return (
    <div className={`grid grid-cols-3 gap-${compactMode ? '1' : '4'}`}>
      <Card className={compactMode ? 'p-0' : ''}>
        <CardContent className={compactMode ? 'p-2 pt-2' : 'pt-6'}>
          <div className="flex items-center space-x-2">
            <Users className={`${compactMode ? 'h-7 w-7' : 'h-10 w-10'} text-primary p-1 border rounded-full`} />
            <div>
              <p className={`${compactMode ? 'text-xxs' : 'text-sm'} text-muted-foreground`}>Total Teams</p>
              <h3 className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold`}>
                {isLoading ? <LoadingSpinner size={compactMode ? 3 : 4} /> : totalTeams}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className={compactMode ? 'p-0' : ''}>
        <CardContent className={compactMode ? 'p-2 pt-2' : 'pt-6'}>
          <div className="flex items-center space-x-2">
            <Shield className={`${compactMode ? 'h-7 w-7' : 'h-10 w-10'} text-primary p-1 border rounded-full`} />
            <div>
              <p className={`${compactMode ? 'text-xxs' : 'text-sm'} text-muted-foreground`}>Divisions</p>
              <h3 className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold`}>
                {isLoading ? <LoadingSpinner size={compactMode ? 3 : 4} /> : uniqueDivisions}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className={compactMode ? 'p-0' : ''}>
        <CardContent className={compactMode ? 'p-2 pt-2' : 'pt-6'}>
          <div className="flex items-center space-x-2">
            <Trophy className={`${compactMode ? 'h-7 w-7' : 'h-10 w-10'} text-primary p-1 border rounded-full`} />
            <div>
              <p className={`${compactMode ? 'text-xxs' : 'text-sm'} text-muted-foreground truncate`}>{compactMode ? "100% Wins" : "Teams with 100% Win Rate"}</p>
              <h3 className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold`}>
                {isLoading ? <LoadingSpinner size={compactMode ? 3 : 4} /> : displayTeams.filter(t => parseFloat(t.winPercentage) === 100).length}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamStats;
