
import React from 'react';
import MainLayout from "../components/layout/MainLayout";
import { useTeamData } from '@/hooks/use-team-data';
import { useIsMobile } from '@/hooks/use-mobile';
import SearchHeader from '../components/teams/SearchHeader';
import TeamStats from '../components/teams/TeamStats';
import TeamDivisionList from '../components/teams/TeamDivisionList';
import TeamErrorCard from '../components/teams/TeamErrorCard';
import TeamEmptyState from '../components/teams/TeamEmptyState';
import LoadingCard from '../components/teams/LoadingCard';

const Teams = () => {
  const { 
    isLoading, 
    teamsError, 
    searchQuery, 
    setSearchQuery, 
    sortColumn, 
    sortDirection, 
    handleSort, 
    openDivisions,
    sortedDivisions, 
    displayTeams, 
    totalTeams, 
    uniqueDivisions,
    teamsByDivision
  } = useTeamData();
  
  const isMobile = useIsMobile();
  const compactMode = isMobile;

  return (
    <MainLayout>
      <div className={`space-y-${compactMode ? '2' : '6'}`}>
        {!compactMode && (
          <SearchHeader 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        
        {!compactMode && (
          <TeamStats
            isLoading={isLoading}
            totalTeams={totalTeams}
            uniqueDivisions={uniqueDivisions}
            displayTeams={displayTeams}
          />
        )}
        
        {compactMode && (
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold tracking-tight">Teams</h1>
          </div>
        )}
        
        {isLoading && <LoadingCard />}
        
        {teamsError && !isLoading && <TeamErrorCard error={teamsError} />}
        
        {!isLoading && Object.keys(teamsByDivision).length === 0 && <TeamEmptyState />}
        
        {Object.keys(teamsByDivision).length > 0 && (
          <TeamDivisionList
            sortedDivisions={sortedDivisions}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            hasError={!!teamsError}
            openDivisions={openDivisions}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Teams;
