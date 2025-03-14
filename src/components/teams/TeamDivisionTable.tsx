
import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Team } from '@/types/cricket';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
      className="border border-gray-700 dark:border-gray-700 rounded-lg overflow-hidden my-4 bg-background/30"
    >
      <CollapsibleTrigger 
        className={`flex items-center justify-between w-full ${compactMode ? 'p-1.5' : 'p-3'} bg-muted/10 hover:bg-muted/20 transition-colors`}
        showArrow={false}
      >
        <div className="flex items-center gap-2 font-medium text-xs">
          <Shield className={`${compactMode ? 'h-3 w-3' : 'h-5 w-5'} text-primary`} />
          <span>{divisionName}</span>
          <Badge variant="outline" className={compactMode ? 'text-[0.6rem] py-0 px-1 h-4' : ''}>{teams.length} Teams</Badge>
        </div>
        {isOpen ? 
          <ChevronUp className={`${compactMode ? 'h-3 w-3' : 'h-5 w-5'}`} /> : 
          <ChevronDown className={`${compactMode ? 'h-3 w-3' : 'h-5 w-5'}`} />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="overflow-x-auto">
          <Table className={compactMode ? 'text-[0.6rem] border-collapse' : ''}>
            <TableHeader className="sticky top-0 bg-card/80">
              <TableRow className={compactMode ? 'h-5' : ''}>
                <TableHead className={`${compactMode ? 'w-[100px] py-0.5 px-0.5' : 'w-[180px]'}`}>
                  Team
                </TableHead>
                <TableHead className="text-center w-[20px] py-0.5 px-0.5">
                  G
                </TableHead>
                <TableHead className="text-center w-[20px] py-0.5 px-0.5">
                  W
                </TableHead>
                <TableHead className="text-center w-[20px] py-0.5 px-0.5">
                  L
                </TableHead>
                <TableHead className="text-center w-[20px] py-0.5 px-0.5">
                  D
                </TableHead>
                <TableHead className="text-center w-[25px] py-0.5 px-0.5">
                  %
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.Id} className={compactMode ? 'h-5' : ''}>
                  <TableCell className="font-medium truncate py-0.5 px-0.5">
                    {team.Name}
                  </TableCell>
                  <TableCell className="text-center py-0.5 px-0.5">
                    {team.completedMatches || team.Games || 0}
                  </TableCell>
                  <TableCell className="text-center py-0.5 px-0.5">
                    {team.Wins || 0}
                  </TableCell>
                  <TableCell className="text-center py-0.5 px-0.5">
                    {team.Losses || 0}
                  </TableCell>
                  <TableCell className="text-center py-0.5 px-0.5">
                    {team.Draws || 0}
                  </TableCell>
                  <TableCell className="text-center py-0.5 px-0.5">
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
