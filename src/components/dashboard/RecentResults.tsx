
import { Fixture } from "@/types/cricket";
import { formatDate } from "@/utils/dateFormatters";
import { Calendar, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface RecentResultsProps {
  fixtures: Fixture[];
  mostRecentDate: string | undefined;
  expandedSection: string | null;
  toggleSection: (section: string) => void;
}

export const RecentResults = ({ 
  fixtures, 
  mostRecentDate, 
  expandedSection, 
  toggleSection 
}: RecentResultsProps) => {
  const isMobile = useIsMobile();
  const compactMode = isMobile;

  // Group fixtures by division
  const fixturesByDivision = fixtures.reduce((acc, fixture) => {
    const division = fixture.DivisionName || 'Other';
    if (!acc[division]) {
      acc[division] = [];
    }
    acc[division].push(fixture);
    return acc;
  }, {} as Record<string, Fixture[]>);

  // Order divisions
  const orderedDivisions = Object.keys(fixturesByDivision).sort((a, b) => {
    const divOrder = { "Div 1": 1, "Div 2": 2, "Div 3": 3 };
    const orderA = divOrder[a] || 99;
    const orderB = divOrder[b] || 99;
    return orderA - orderB;
  });

  // Render match function
  const renderMatch = (fixture: Fixture) => (
    <div key={fixture.Id} className="flex justify-between items-center py-1 border-b border-gray-800 last:border-0">
      <div className="flex-1">
        <span className={cn(
          "team-name text-[0.6rem]",
          fixture.HomeTeamWon && "team-name-winner"
        )}>
          {fixture.HomeTeam}
        </span>
      </div>
      <div className="flex-none px-1 text-[0.6rem] text-muted-foreground">vs</div>
      <div className="flex-1">
        <span className={cn(
          "team-name text-[0.6rem]",
          fixture.AwayTeamWon && "team-name-winner"
        )}>
          {fixture.AwayTeam}
        </span>
      </div>
      <div className="flex-none flex items-center justify-end">
        <span className="text-[0.6rem] whitespace-nowrap">
          {fixture.ScoreDescription || `${fixture.HomeTeamScore}-${fixture.AwayTeamScore}`}
        </span>
        <Link to={`/match/${fixture.Id}`} className="text-primary ml-0.5">
          <ArrowUpRight className="h-2.5 w-2.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <Collapsible 
      open={expandedSection === "recentResults"} 
      onOpenChange={() => toggleSection("recentResults")}
      className="border border-gray-700 rounded-lg overflow-hidden dark-results-container"
    >
      <CollapsibleTrigger className="w-full">
        <div className="flex justify-between items-center p-2 dark-results-header">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-primary mr-1.5" />
            <span className="font-semibold text-sm">Recent Results</span>
            {mostRecentDate && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                {formatDate(mostRecentDate)}
              </span>
            )}
          </div>
          {expandedSection === "recentResults" ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-0 pb-2">
        {orderedDivisions.length > 0 ? (
          <div className="space-y-1 p-2">
            {orderedDivisions.map(division => (
              <div key={division} className="space-y-0.5">
                <h3 className="text-[0.65rem] font-semibold px-2 py-0.5 bg-[#1e293b] rounded-sm">
                  {division}
                </h3>
                <div className="px-2">
                  {fixturesByDivision[division].map(renderMatch)}
                </div>
              </div>
            ))}
            <div className="text-center mt-2">
              <Link 
                to="/fixtures" 
                className="text-[0.65rem] text-primary hover:underline inline-flex items-center"
              >
                View All Results <ArrowUpRight className="ml-0.5 h-2.5 w-2.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-3 text-muted-foreground px-4 text-xs">
            No recent results available
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
