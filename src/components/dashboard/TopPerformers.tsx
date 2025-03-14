
import { Player } from "@/types/cricket";
import { BarChart3, Trophy, ArrowUpRight } from "lucide-react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TopPerformersProps {
  players: Player[];
  activeDivision: string;
  setActiveDivision: (division: string) => void;
  activeStatsTab: "batting" | "bowling";
  setActiveStatsTab: (tab: "batting" | "bowling") => void;
  allDivisions: string[];
  expandedSection: string | null;
  toggleSection: (section: string) => void;
}

export const TopPerformers = ({
  players,
  activeDivision,
  setActiveDivision,
  activeStatsTab,
  setActiveStatsTab,
  allDivisions,
  expandedSection,
  toggleSection
}: TopPerformersProps) => {
  // Filter players based on active division
  const getFilteredPlayers = () => {
    let filteredPlayers = [...players];
    
    if (activeDivision !== "all") {
      filteredPlayers = filteredPlayers.filter(player => 
        player.DivisionName === activeDivision
      );
    }
    
    return filteredPlayers;
  };
  
  const topBatsmen = getFilteredPlayers()
    .sort((a, b) => parseInt(b.RunsScored) - parseInt(a.RunsScored))
    .slice(0, 5);
    
  const topBowlers = getFilteredPlayers()
    .sort((a, b) => parseInt(b.Wickets) - parseInt(a.Wickets))
    .slice(0, 5);

  return (
    <Collapsible 
      open={expandedSection === "topPlayers"} 
      onOpenChange={() => toggleSection("topPlayers")}
      className="border rounded-lg shadow-sm"
    >
      <CollapsibleTrigger className="w-full">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-primary mr-2" />
            <span className="font-semibold">Top Performers</span>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        <Tabs 
          defaultValue="batting" 
          value={activeStatsTab} 
          onValueChange={(value) => setActiveStatsTab(value as "batting" | "bowling")}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 mb-4 bg-slate-900 dark:bg-slate-800 p-1 rounded-md">
            <TabsTrigger 
              value="batting" 
              className="data-[state=active]:bg-slate-800 data-[state=active]:dark:bg-slate-700 text-white data-[state=active]:text-white"
            >
              Batting
            </TabsTrigger>
            <TabsTrigger 
              value="bowling"
              className="data-[state=active]:bg-slate-800 data-[state=active]:dark:bg-slate-700 text-white data-[state=active]:text-white"
            >
              Bowling
            </TabsTrigger>
          </TabsList>
          
          <ToggleGroup 
            type="single" 
            value={activeDivision}
            onValueChange={(value) => {
              if (value) setActiveDivision(value);
            }}
            className="w-full grid grid-cols-4 mb-4 bg-slate-900 dark:bg-slate-800 p-1 rounded-md"
            darkStyle={true}
          >
            <ToggleGroupItem value="all" darkStyle={true}>
              All
            </ToggleGroupItem>
            {allDivisions.map(div => (
              <ToggleGroupItem key={div} value={div} darkStyle={true}>
                {div}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          
          <TabsContent value="batting" className="mt-0">
            <div className="space-y-2">
              {topBatsmen.slice(0, 3).map((player, index) => (
                <div key={player.Id} className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  index === 0 ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" :
                  index === 1 ? "bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800" :
                  index === 2 ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800" :
                  "bg-background border"
                )}>
                  <div className="flex items-center">
                    {index === 0 && <Trophy className="h-4 w-4 text-amber-500 mr-1" />}
                    {index === 1 && <Trophy className="h-4 w-4 text-slate-400 mr-1" />}
                    {index === 2 && <Trophy className="h-4 w-4 text-orange-600 mr-1" />}
                    <div>
                      <p className="font-medium">{player.UserName}</p>
                      <p className="text-xs text-muted-foreground">{player.TeamName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{player.RunsScored}</p>
                    <p className="text-xs text-muted-foreground">runs</p>
                  </div>
                </div>
              ))}
              <div className="text-center mt-2">
                <Link 
                  to="/stats" 
                  className="text-sm text-primary hover:underline inline-flex items-center"
                >
                  View All Batsmen <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bowling" className="mt-0">
            <div className="space-y-2">
              {topBowlers.slice(0, 3).map((player, index) => (
                <div key={player.Id} className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  index === 0 ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" :
                  index === 1 ? "bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800" :
                  index === 2 ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800" :
                  "bg-background border"
                )}>
                  <div className="flex items-center">
                    {index === 0 && <Trophy className="h-4 w-4 text-emerald-500 mr-1" />}
                    {index === 1 && <Trophy className="h-4 w-4 text-slate-400 mr-1" />}
                    {index === 2 && <Trophy className="h-4 w-4 text-orange-600 mr-1" />}
                    <div>
                      <p className="font-medium">{player.UserName}</p>
                      <p className="text-xs text-muted-foreground">{player.TeamName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{player.Wickets}</p>
                    <p className="text-xs text-muted-foreground">wickets</p>
                  </div>
                </div>
              ))}
              <div className="text-center mt-2">
                <Link 
                  to="/stats" 
                  className="text-sm text-primary hover:underline inline-flex items-center"
                >
                  View All Bowlers <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  );
};
