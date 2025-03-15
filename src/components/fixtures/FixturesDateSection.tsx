
import React from 'react';
import { Fixture } from '../../types/cricket';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "lucide-react";
import { FixtureDivisionSection } from './FixtureDivisionSection';

interface FixturesDateSectionProps {
  date: string;
  dateFixtures: Fixture[];
  fixturesByDivision: Record<string, Fixture[]>;
  sortedDivisions: string[];
  openDateSections: Record<string, boolean>;
  openDivisionSections: Record<string, boolean>;
  toggleDateSection: (date: string) => void;
  toggleDivisionSection: (divisionKey: string) => void;
}

export const FixturesDateSection = ({ 
  date, 
  fixturesByDivision, 
  sortedDivisions, 
  openDateSections, 
  openDivisionSections, 
  toggleDateSection, 
  toggleDivisionSection 
}: FixturesDateSectionProps) => {
  return (
    <Collapsible 
      key={date}
      open={!!openDateSections[date]}
      onOpenChange={() => toggleDateSection(date)}
      className="border border-gray-800 rounded-md overflow-hidden"
    >
      <CollapsibleTrigger className="w-full flex justify-between items-center p-1.5 bg-background/50 hover:bg-background/70">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 text-primary mr-1.5" />
          <span className="font-semibold text-xs">{date}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 py-1">
          {sortedDivisions.map(division => {
            const divisionKey = `${date}-${division}`;
            const isOpen = openDivisionSections[divisionKey] !== false;
            
            return (
              <FixtureDivisionSection
                key={divisionKey}
                division={division}
                fixtures={fixturesByDivision[division]}
                divisionKey={divisionKey}
                isOpen={isOpen}
                toggleDivisionSection={toggleDivisionSection}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
