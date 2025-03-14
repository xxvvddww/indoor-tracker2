
import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, ChevronUp, ChevronDown } from 'lucide-react';
import { Team } from '@/types/cricket';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from '@/hooks/use-mobile';

interface TeamDivisionTableProps {
  divisionName: string;
  teams: Team[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  initialOpen?: boolean;
  preserveOpenState?: boolean;
}

const TeamDivisionTable = ({ 
  divisionName, 
  teams, 
  sortColumn, 
  sortDirection, 
  onSort,
  initialOpen = true,
  preserveOpenState = false 
}: TeamDivisionTableProps) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const isMobile = useIsMobile();
  const compactMode = isMobile;
  
  useEffect(() => {
    if (!preserveOpenState) {
      setIsOpen(initialOpen);
    }
  }, [initialOpen, preserveOpenState]);
  
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  const renderSortIcon = useCallback((column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1 inline" /> 
      : <ChevronDown className="h-4 w-4 ml-1 inline" />;
  }, [sortColumn, sortDirection]);

  return (
    <Collapsible 
      open={isOpen}
      onOpenChange={handleToggle}
      className={`${compactMode ? 'border-0' : 'border'} rounded-lg overflow-hidden`}
      preserveState={true}
    >
      <CollapsibleTrigger 
        className={`flex items-center justify-between w-full ${compactMode ? 'p-2' : 'p-4'} bg-muted/30 hover:bg-muted/50 transition-colors`}
      >
        <div className="flex items-center gap-2 font-medium text-sm">
          <Shield className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
          <span>{divisionName}</span>
          <Badge variant="outline" className={compactMode ? 'text-xxs py-0 px-1' : ''}>{teams.length} Teams</Badge>
        </div>
        {isOpen ? 
          <ChevronUp className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'}`} /> : 
          <ChevronDown className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'}`} />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="overflow-x-auto">
          <Table className={compactMode ? 'text-xxs' : ''}>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow className={compactMode ? 'h-8' : ''}>
                <TableHead 
                  className={`cursor-pointer ${compactMode ? 'w-[100px] py-1 px-1' : 'w-[180px]'}`}
                  onClick={() => onSort('Name')}
                >
                  Team {renderSortIcon('Name')}
                </TableHead>
                <TableHead 
                  className={`cursor-pointer text-center ${compactMode ? 'py-1 px-1' : ''}`}
                  onClick={() => onSort('Players')}
                >
                  {compactMode ? 'Pl' : 'Players'} {renderSortIcon('Players')}
                </TableHead>
                <TableHead 
                  className={`cursor-pointer text-center ${compactMode ? 'py-1 px-1' : ''}`}
                  onClick={() => onSort('Games')}
                >
                  {compactMode ? 'G' : 'Games'} {renderSortIcon('Games')}
                </TableHead>
                <TableHead 
                  className={`cursor-pointer text-center ${compactMode ? 'py-1 px-1' : ''}`}
                  onClick={() => onSort('Wins')}
                >
                  {compactMode ? 'W' : 'Wins'} {renderSortIcon('Wins')}
                </TableHead>
                {!compactMode && (
                  <TableHead 
                    className="cursor-pointer text-center" 
                    onClick={() => onSort('Losses')}
                  >
                    Losses {renderSortIcon('Losses')}
                  </TableHead>
                )}
                <TableHead 
                  className={`cursor-pointer text-center ${compactMode ? 'py-1 px-1' : ''}`}
                  onClick={() => onSort('Win%')}
                >
                  {compactMode ? '%' : 'Win%'} {renderSortIcon('Win%')}
                </TableHead>
                {!compactMode && (
                  <TableHead 
                    className="cursor-pointer text-center" 
                    onClick={() => onSort('Skins')}
                  >
                    Skins Won {renderSortIcon('Skins')}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.Id} className={compactMode ? 'h-8' : ''}>
                  <TableCell className={`font-medium truncate ${compactMode ? 'py-1 px-1' : ''}`}>
                    {team.Name}
                  </TableCell>
                  <TableCell className={`text-center ${compactMode ? 'py-1 px-1' : ''}`}>
                    {team.playerCount || '-'}
                  </TableCell>
                  <TableCell className={`text-center ${compactMode ? 'py-1 px-1' : ''}`}>
                    {team.completedMatches}
                  </TableCell>
                  <TableCell className={`text-center ${compactMode ? 'py-1 px-1' : ''}`}>
                    {team.wins}
                  </TableCell>
                  {!compactMode && (
                    <TableCell className="text-center">
                      {team.losses}
                    </TableCell>
                  )}
                  <TableCell className={`text-center ${compactMode ? 'py-1 px-1' : ''}`}>
                    {compactMode ? parseFloat(team.winPercentage).toFixed(0) : team.winPercentage}%
                  </TableCell>
                  {!compactMode && (
                    <TableCell className="text-center">
                      {team.skinsWon}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TeamDivisionTable;
