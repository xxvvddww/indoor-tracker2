
import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Team } from '@/types/cricket';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from '@/hooks/use-mobile';

interface TeamDivisionTableProps {
  divisionName: string;
  teams: Team[];
  initialOpen?: boolean;
  preserveOpenState?: boolean;
}

const TeamDivisionTable = ({ 
  divisionName, 
  teams, 
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

  return (
    <Collapsible 
      open={isOpen}
      onOpenChange={handleToggle}
      className={`relative rounded-lg overflow-hidden my-4 ${isOpen ? 'moving-border' : 'border-2 border-gray-400 dark:border-gray-600'}`}
    >
      <CollapsibleTrigger 
        className={`flex items-center justify-between w-full ${compactMode ? 'p-2' : 'p-4'} bg-muted/30 hover:bg-muted/50 transition-colors`}
        showArrow={false}
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
                <TableHead className={`${compactMode ? 'w-[100px] py-1 px-1' : 'w-[180px]'}`}>
                  Team
                </TableHead>
                <TableHead className="text-center w-[30px] py-1 px-1">
                  G
                </TableHead>
                <TableHead className="text-center w-[30px] py-1 px-1">
                  W
                </TableHead>
                <TableHead className="text-center w-[30px] py-1 px-1">
                  L
                </TableHead>
                <TableHead className="text-center w-[30px] py-1 px-1">
                  D
                </TableHead>
                <TableHead className="text-center w-[30px] py-1 px-1">
                  %
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
                    {team.Wins || 0}
                  </TableCell>
                  <TableCell className="text-center py-1 px-1">
                    {team.Losses || 0}
                  </TableCell>
                  <TableCell className="text-center py-1 px-1">
                    {team.Draws || 0}
                  </TableCell>
                  <TableCell className="text-center py-1 px-1">
                    {team.WinPercentage 
                      ? (typeof team.WinPercentage === 'string' ? parseInt(team.WinPercentage) : Math.round(team.WinPercentage)) 
                      : 0}%
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
