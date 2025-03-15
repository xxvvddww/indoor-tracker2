
import React from 'react';
import { Fixture } from '../../types/cricket';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { ArrowUpRight } from "lucide-react";
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FixtureDivisionSectionProps {
  division: string;
  fixtures: Fixture[];
  divisionKey: string;
  isOpen: boolean;
  toggleDivisionSection: (key: string) => void;
}

export const FixtureDivisionSection = ({ 
  division, 
  fixtures, 
  divisionKey, 
  isOpen, 
  toggleDivisionSection 
}: FixtureDivisionSectionProps) => {
  const resultColumns = [
    {
      key: "HomeTeam",
      header: "Home",
      className: "text-left w-1/3",
      render: (value: string, row: Fixture) => (
        <span className={cn(
          "text-[0.65rem] whitespace-nowrap",
          row.HomeTeamWon && "text-green-500 dark:text-green-400 font-medium"
        )}>
          {value || 'TBD'}
        </span>
      )
    },
    {
      key: "vs",
      header: "",
      className: "w-6 text-center px-0",
      render: () => <span className="text-[0.65rem] text-muted-foreground">vs</span>
    },
    {
      key: "AwayTeam",
      header: "Away",
      className: "text-left w-1/3",
      render: (value: string, row: Fixture) => (
        <span className={cn(
          "text-[0.65rem] whitespace-nowrap",
          row.AwayTeamWon && "text-green-500 dark:text-green-400 font-medium"
        )}>
          {value || 'TBD'}
        </span>
      )
    },
    {
      key: "Result",
      header: "Result",
      className: "w-16 text-right",
      render: (value: string, row: Fixture) => (
        <div className="flex items-center justify-end gap-0.5">
          <span className="text-[0.65rem] whitespace-nowrap">
            {row.HomeTeamScore}-{row.AwayTeamScore}
          </span>
          <Link to={`/match/${row.Id}`} className="text-primary ml-0.5">
            <ArrowUpRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      )
    }
  ];

  return (
    <Collapsible 
      key={divisionKey}
      open={isOpen}
      onOpenChange={() => toggleDivisionSection(divisionKey)}
      className="border border-gray-800/60 rounded mx-1 overflow-hidden"
    >
      <CollapsibleTrigger className="w-full flex justify-between items-center p-1 bg-gray-900/40 hover:bg-gray-900/60">
        <div className="flex items-center">
          <span className="font-medium text-[0.7rem] text-purple-400">{division}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ResponsiveTable
          data={fixtures}
          columns={resultColumns}
          keyField="Id"
          resultsMode={true}
          darkMode={true}
          hideHeader={true}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};
