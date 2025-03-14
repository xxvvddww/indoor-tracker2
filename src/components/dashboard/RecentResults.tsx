
import { Fixture } from "@/types/cricket";
import { formatDate } from "@/utils/dateFormatters";
import { Calendar, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveTable } from "@/components/ui/responsive-table";
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

  const recentResultsColumns = [
    {
      key: "HomeTeam",
      header: "Match",
      render: (value: string, row: Fixture) => (
        <span className={cn(
          "text-xs font-medium",
          row.HomeTeamWon && "text-green-500 dark:text-green-400"
        )}>
          {value}
        </span>
      ),
    },
    {
      key: "vs",
      header: "vs",
      className: "w-8 text-center",
      render: () => <span className="text-xs text-muted-foreground">vs</span>,
    },
    {
      key: "AwayTeam",
      header: "Away",
      render: (value: string, row: Fixture) => (
        <span className={cn(
          "text-xs font-medium",
          row.AwayTeamWon && "text-green-500 dark:text-green-400"
        )}>
          {value}
        </span>
      ),
    },
    {
      key: "ScoreDescription",
      header: "Result",
      className: "w-20 text-right",
      render: (value: string, row: Fixture) => (
        <div className="flex items-center justify-end gap-1">
          <span className="text-xs">{value || `${row.HomeTeamScore} - ${row.AwayTeamScore}`}</span>
          <Link to={`/match/${row.Id}`} className="text-primary ml-1">
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <Collapsible 
      open={expandedSection === "recentResults"} 
      onOpenChange={() => toggleSection("recentResults")}
      className="border border-gray-700 rounded-lg overflow-hidden bg-background/30"
    >
      <CollapsibleTrigger className="w-full">
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            <span className="font-semibold">Recent Results</span>
            {mostRecentDate && (
              <span className="ml-2 text-xs text-muted-foreground">
                {formatDate(mostRecentDate)}
              </span>
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-0 pb-2">
        {orderedDivisions.length > 0 ? (
          <div className="space-y-1">
            {orderedDivisions.map(division => (
              <div key={division} className="space-y-1">
                <h3 className="text-xs font-semibold px-3 py-1 bg-muted/10">
                  {division}
                </h3>
                <ResponsiveTable
                  data={fixturesByDivision[division]}
                  columns={recentResultsColumns}
                  keyField="Id"
                  superCompact={true}
                  darkMode={true}
                  className="px-2"
                />
              </div>
            ))}
            <div className="text-center mt-2">
              <Link 
                to="/fixtures" 
                className="text-xs text-primary hover:underline inline-flex items-center"
              >
                View All Results <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground px-4 text-sm">
            No recent results available
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
