
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
        className="flex items-center justify-between w-full p-2 bg-[#1e293b] hover:bg-[#0f172a] transition-colors"
        showArrow={false}
      >
        <div className="flex items-center gap-2 font-medium text-xs">
          <Shield className="h-4 w-4 text-primary" />
          <span>{divisionName}</span>
          <Badge variant="outline" className={compactMode ? 'text-[0.6rem] py-0 px-1 h-4' : ''}>{teams.length} Teams</Badge>
        </div>
        {isOpen ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="overflow-x-auto p-2">
          <Table className={compactMode ? 'text-[0.6rem] border-collapse' : ''}>
            <TableHeader className="sticky top-0 bg-card/80">
              <TableRow className={compactMode ? 'h-6' : ''}>
                <TableHead className="w-[180px] py-1 px-2">
                  Team
                </TableHead>
                <TableHead className="text-center w-[30px] py-1 px-2">
                  G
                </TableHead>
                <TableHead className="text-center w-[30px] py-1 px-2">
                  W
                </TableHead>
                <TableHead className="text-center w-[30px] py-1 px-2">
                  L
                </TableHead>
                <TableHead className="text-center w-[30px] py-1 px-2">
                  D
                </TableHead>
                <TableHead className="text-center w-[40px] py-1 px-2">
                  %
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.Id} className={compactMode ? 'h-6' : ''}>
                  <TableCell className="font-medium truncate py-1 px-2">
                    <div className="team-name">
                      {team.Name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-1 px-2">
                    {team.completedMatches || team.Games || 0}
                  </TableCell>
                  <TableCell className="text-center py-1 px-2">
                    {team.Wins || 0}
                  </TableCell>
                  <TableCell className="text-center py-1 px-2">
                    {team.Losses || 0}
                  </TableCell>
                  <TableCell className="text-center py-1 px-2">
                    {team.Draws || 0}
                  </TableCell>
                  <TableCell className="text-center py-1 px-2">
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
