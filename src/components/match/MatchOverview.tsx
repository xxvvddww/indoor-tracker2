
import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import PlayerStatistics from './PlayerStatistics';
import DataExtractor from './DataExtractor';
import { ResponsiveContainer } from '../ui/responsive-container';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MatchOverviewProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const MatchOverview: React.FC<MatchOverviewProps> = ({ displayInfo, matchData }) => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    console.log("MatchOverview rendering with displayInfo:", displayInfo);
    console.log("MatchOverview has matchData:", !!matchData);
    if (matchData) {
      console.log("MatchData keys:", Object.keys(matchData));
    }
  }, [displayInfo, matchData]);

  if (!matchData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-md space-y-2 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No match data available
        </p>
      </div>
    );
  }

  // Function to check if we have actual player data
  const hasPlayerData = () => {
    if (!displayInfo.playerStats) return false;
    
    return Object.values(displayInfo.playerStats).some(team => 
      team.players && team.players.length > 0 && 
      team.players.some(player => !player.Name.includes("No player statistics"))
    );
  };

  // Back to fixtures link
  const BackToFixturesLink = () => (
    <Link to="/fixtures" className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors mb-2">
      <ArrowLeft className="h-3 w-3 mr-1" />
      Back to fixtures
    </Link>
  );

  return (
    <ResponsiveContainer spacing="md" className="px-2">
      {/* Back to fixtures link */}
      <BackToFixturesLink />

      {/* This component extracts data from matchData and updates displayInfo */}
      <DataExtractor displayInfo={displayInfo} matchData={matchData} />
      
      {/* Display summary information at the top */}
      <div className="space-y-4 w-full">
        {/* Match summary section */}
        <div className="space-y-4">
          {/* Match winner */}
          {displayInfo.winner ? (
            <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md border border-green-500/20">
              <Trophy className="h-4 w-4 text-green-500" />
              <p className="text-sm">
                <span className="font-medium">Winner:</span> {displayInfo.winner}
              </p>
            </div>
          ) : null}
          
          {/* Man of the match - formatted as MoM: Name (Team) */}
          {displayInfo.manOfMatch && (
            <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md border border-green-500/20">
              <Trophy className="h-4 w-4 text-green-500" />
              <p className="text-sm">
                <span className="font-medium">MoM:</span> {displayInfo.manOfMatch}
              </p>
            </div>
          )}
        </div>
        
        {/* Player statistics - removed the outer Card and header */}
        <div>
          <PlayerStatistics displayInfo={displayInfo} />
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default MatchOverview;
