
import React from 'react';
import MainLayout from "../components/layout/MainLayout";
import { useTeamData } from '@/hooks/use-team-data';
import { useIsMobile } from '@/hooks/use-mobile';
import TeamDivisionList from '../components/teams/TeamDivisionList';
import TeamErrorCard from '../components/teams/TeamErrorCard';
import TeamEmptyState from '../components/teams/TeamEmptyState';
import LoadingCard from '../components/teams/LoadingCard';
import TeamStats from '../components/teams/TeamStats';

const Teams = () => {
  const { 
    isLoading, 
    teamsError, 
    openDivisions,
    sortedDivisions, 
    displayTeams, 
    totalTeams, 
    uniqueDivisions,
    teamsByDivision,
    teamStats
  } = useTeamData();
  
  const isMobile = useIsMobile();
  const compactMode = isMobile;

  return (
    <MainLayout>
      <div className={`space-y-${compactMode ? '2' : '6'}`}>
        {compactMode && (
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold tracking-tight">Teams</h1>
          </div>
        )}
        
        {/* Team stats overview */}
        {!isLoading && !teamsError && Object.keys(teamsByDivision).length > 0 && (
          <TeamStats
            isLoading={isLoading}
            totalTeams={totalTeams}
            uniqueDivisions={uniqueDivisions}
            displayTeams={teamStats}
          />
        )}
        
        {isLoading && <LoadingCard />}
        
        {teamsError && !isLoading && <TeamErrorCard error={teamsError} />}
        
        {!isLoading && Object.keys(teamsByDivision).length === 0 && <TeamEmptyState />}
        
        {Object.keys(teamsByDivision).length > 0 && (
          <TeamDivisionList
            sortedDivisions={sortedDivisions}
            hasError={!!teamsError}
            openDivisions={openDivisions}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Teams;
