
import { ExternalLink, PlayCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveCard } from "@/components/ui/responsive-card";

interface WatchLiveProps {
  expandedSection: string | null;
  toggleSection: (section: string) => void;
}

export const WatchLive = ({ expandedSection, toggleSection }: WatchLiveProps) => {
  const isMobile = useIsMobile();
  const compactMode = isMobile;

  return (
    <Collapsible 
      open={expandedSection === "watchLive"} 
      onOpenChange={() => toggleSection("watchLive")}
      className="border rounded-lg shadow-sm bg-slate-950/30 dark:bg-slate-950/30"
    >
      <CollapsibleTrigger className="w-full">
        <div className="flex justify-between items-center p-4 h-14">
          <div className="flex items-center">
            <PlayCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="font-semibold">Watch Live</span>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        <div className="space-y-4">
          <div className="aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shadow-lg">
            <a 
              href="https://www.youtube.com/@SeamerSportsCentre" 
              target="_blank"
              rel="noopener noreferrer" 
              className="relative block w-full h-full group"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <PlayCircle className="h-16 w-16 mb-2 group-hover:text-red-500 transition-colors" />
                <h3 className="text-lg font-semibold">Seamer Sports Centre</h3>
                <p className="text-sm text-slate-300">Watch live cricket matches</p>
                <div className="flex items-center mt-4 text-xs text-slate-400">
                  <ExternalLink className="h-3 w-3 mr-1" /> 
                  <span>youtube.com/@SeamerSportsCentre</span>
                </div>
              </div>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ResponsiveCard className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
              <div className="p-3 flex items-center">
                <PlayCircle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-700 dark:text-red-300">Live Matches</h3>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Watch cricket matches streamed live
                  </p>
                </div>
              </div>
            </ResponsiveCard>
            
            <ResponsiveCard className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 border-slate-200 dark:border-slate-800">
              <div className="p-3 flex items-center">
                <ExternalLink className="h-8 w-8 text-slate-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Visit Channel</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Subscribe for match updates
                  </p>
                </div>
              </div>
            </ResponsiveCard>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
