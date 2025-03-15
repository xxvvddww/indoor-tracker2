
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
      className: "home-column",
      render: (value: string, row: Fixture) => (
        <span className={cn(
          "text-[0.6rem] font-medium",
          row.HomeTeamWon && "text-green-500 dark:text-green-400"
        )}>
          {value}
        </span>
      ),
    },
    {
      key: "vs",
      header: "",
      className: "vs-column",
      render: () => <span className="text-[0.6rem] text-muted-foreground">vs</span>,
    },
    {
      key: "AwayTeam",
      header: "Away",
      className: "away-column",
      render: (value: string, row: Fixture) => (
        <span className={cn(
          "text-[0.6rem] font-medium",
          row.AwayTeamWon && "text-green-500 dark:text-green-400"
        )}>
          {value}
        </span>
      ),
    },
    {
      key: "ScoreDescription",
      header: "Result",
      className: "result-column",
      render: (value: string, row: Fixture) => (
        <div className="flex items-center justify-end gap-0.5">
          <span className="text-[0.6rem]">{value || `${row.HomeTeamScore}-${row.AwayTeamScore}`}</span>
          <Link to={`/match/${row.Id}`} className="text-primary ml-0.5">
            <ArrowUpRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <Collapsible 
      open={expandedSection === "recentResults"} 
      onOpenChange={() => toggleSection("recentResults")}
      className="border rounded-lg shadow-sm bg-slate-950/30 dark:bg-slate-950/30"
    >
      <CollapsibleTrigger className="w-full">
        <div className="flex justify-between items-center p-4 h-14">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-indigo-400 mr-2" />
            <span className="font-semibold">Recent Results</span>
            {mostRecentDate && (
              <span className="ml-1.5 text-xs text-muted-foreground">
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
              <div key={division} className="space-y-0.5">
                <h3 className="division-header text-purple-400 text-xs font-medium px-2 py-1">
                  {division}
                </h3>
                <div className="px-1">
                  <ResponsiveTable
                    data={fixturesByDivision[division]}
                    columns={recentResultsColumns}
                    keyField="Id"
                    superCompact={true}
                    ultraCompact={true}
                    darkMode={true}
                    className="aligned-results-table"
                  />
                </div>
              </div>
            ))}
            <div className="text-center mt-1">
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
