
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
      className="border-2 border-gray-400 dark:border-gray-600 rounded-lg overflow-hidden mb-3"
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
                  className="cursor-pointer text-center w-[30px] py-1 px-1"
                  onClick={() => onSort('Games')}
                >
                  G {renderSortIcon('Games')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-center w-[30px] py-1 px-1"
                  onClick={() => onSort('Wins')}
                >
                  W {renderSortIcon('Wins')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-center w-[30px] py-1 px-1"
                  onClick={() => onSort('Losses')}
                >
                  L {renderSortIcon('Losses')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-center w-[30px] py-1 px-1"
                  onClick={() => onSort('Draws')}
                >
                  D {renderSortIcon('Draws')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-center w-[30px] py-1 px-1"
                  onClick={() => onSort('Win%')}
                >
                  % {renderSortIcon('Win%')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.Id} className={compactMode ? 'h-8' : ''}>
                  <TableCell className="font-medium truncate py-1 px-1">
                    {team.Name}
                  </TableCell>
                  <TableCell className="text-center py-1 px-1">
                    {team.completedMatches || team.Games || 0}
                  </TableCell>
                  <TableCell className="text-center py-1 px-1">
                    {team.Wins || (team as any).wins || 0}
                  </TableCell>
                  <TableCell className="text-center py-1 px-1">
                    {team.Losses || (team as any).losses || 0}
                  </TableCell>
                  <TableCell className="text-center py-1 px-1">
                    {team.Draws || (team as any).draws || 0}
                  </TableCell>
                  <TableCell className="text-center py-1 px-1">
                    {team.WinPercentage 
                      ? (typeof team.WinPercentage === 'string' ? parseFloat(team.WinPercentage).toFixed(0) : team.WinPercentage.toFixed(0)) 
                      : (team as any).winPercentage 
                        ? parseFloat((team as any).winPercentage).toFixed(0) 
                        : '0'}
                  </TableCell>
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
