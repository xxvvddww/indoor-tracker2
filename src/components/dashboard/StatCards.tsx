
import { Player } from "@/types/cricket";
import { ResponsiveCard } from "@/components/ui/responsive-card";
import { Trophy, Users, Star, Award } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatCardsProps {
  playersCount: number;
  completedMatchesCount: number;
  mostWicketsPlayer: Player | null;
  mostRunsPlayer: Player | null;
}

export const StatCards = ({ 
  playersCount, 
  completedMatchesCount, 
  mostWicketsPlayer, 
  mostRunsPlayer 
}: StatCardsProps) => {
  const isMobile = useIsMobile();
  const compactMode = isMobile;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      <ResponsiveCard 
        className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800"
      >
        <div className="p-2 flex flex-col items-center text-center">
          <Users className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'} text-purple-500 mb-0.5`} />
          <h3 className={`${compactMode ? 'text-xs' : 'text-xs'} font-medium text-purple-700 dark:text-purple-300 mb-0.5`}>
            Active Players
          </h3>
          <p className={`${compactMode ? 'text-base' : 'text-lg'} font-bold text-purple-800 dark:text-purple-200`}>
            {playersCount}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-0">
            This season
          </p>
        </div>
      </ResponsiveCard>
      
      <ResponsiveCard 
        className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
      >
        <div className="p-2 flex flex-col items-center text-center">
          <Trophy className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'} text-green-500 mb-0.5`} />
          <h3 className={`${compactMode ? 'text-xs' : 'text-xs'} font-medium text-green-700 dark:text-green-300 mb-0.5`}>
            Completed Matches
          </h3>
          <p className={`${compactMode ? 'text-base' : 'text-lg'} font-bold text-green-800 dark:text-green-200`}>
            {completedMatchesCount}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0">
            This season
          </p>
        </div>
      </ResponsiveCard>
      
      <ResponsiveCard 
        className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800"
      >
        <div className="p-2 flex flex-col items-center text-center">
          <Star className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'} text-emerald-500 mb-0.5`} />
          <h3 className={`${compactMode ? 'text-xs' : 'text-xs'} font-medium text-emerald-700 dark:text-emerald-300 mb-0.5`}>
            Most Wickets
          </h3>
          {mostWicketsPlayer ? (
            <>
              <p className={`${compactMode ? 'text-base' : 'text-lg'} font-bold text-emerald-800 dark:text-emerald-200`}>
                {mostWicketsPlayer.Wickets}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0 truncate max-w-full">
                {mostWicketsPlayer.UserName}
              </p>
            </>
          ) : (
            <>
              <p className={`${compactMode ? 'text-base' : 'text-lg'} font-bold text-emerald-800 dark:text-emerald-200`}>
                -
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0">
                No data
              </p>
            </>
          )}
        </div>
      </ResponsiveCard>
      
      <ResponsiveCard 
        className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800"
      >
        <div className="p-2 flex flex-col items-center text-center">
          <Award className={`${compactMode ? 'h-4 w-4' : 'h-5 w-5'} text-amber-500 mb-0.5`} />
          <h3 className={`${compactMode ? 'text-xs' : 'text-xs'} font-medium text-amber-700 dark:text-amber-300 mb-0.5`}>
            Most Runs
          </h3>
          {mostRunsPlayer ? (
            <>
              <p className={`${compactMode ? 'text-base' : 'text-lg'} font-bold text-amber-800 dark:text-amber-200`}>
                {mostRunsPlayer.RunsScored}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0 truncate max-w-full">
                {mostRunsPlayer.UserName}
              </p>
            </>
          ) : (
            <>
              <p className={`${compactMode ? 'text-base' : 'text-lg'} font-bold text-amber-800 dark:text-amber-200`}>
                -
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0">
                No data
              </p>
            </>
          )}
        </div>
      </ResponsiveCard>
    </div>
  );
};
