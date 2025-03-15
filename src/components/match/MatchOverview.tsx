
import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import PlayerStatistics from './PlayerStatistics';
import DataExtractor from './DataExtractor';
import { ResponsiveContainer } from '../ui/responsive-container';
import { Trophy, ArrowLeft, User } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MatchOverviewProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const MatchOverview: React.FC<MatchOverviewProps> = ({ displayInfo, matchData }) => {
  const isMobile = useIsMobile();
  
  // Calculate team scores from player statistics
  const calculateTeamScores = () => {
    if (!displayInfo.playerStats || !displayInfo.teams) return;
    
    displayInfo.teams.forEach(team => {
      if (displayInfo.playerStats && displayInfo.playerStats[team.id]) {
        const teamPlayers = displayInfo.playerStats[team.id].players;
        let totalRuns = 0;
        
        teamPlayers.forEach(player => {
          const runs = parseInt(player.RS || '0');
          if (!isNaN(runs)) {
            totalRuns += runs;
          }
        });
        
        // Update team score
        team.score = totalRuns.toString();
      }
    });
  };
  
  useEffect(() => {
    console.log("MatchOverview rendering with displayInfo:", displayInfo);
    console.log("MatchOverview has matchData:", !!matchData);
    if (matchData) {
      console.log("MatchData keys:", Object.keys(matchData));
      
      // Calculate team scores based on player statistics
      calculateTeamScores();
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
      
      {/* Unified Match Summary Box */}
      {displayInfo.teams && displayInfo.teams.length > 0 && (
        <div className="w-full overflow-hidden rounded-xl bg-slate-900 shadow-lg">
          {/* Match Score Section */}
          <div className="flex items-center justify-between p-4 text-center">
            <div className="flex-1 text-center">
              <p className="text-base sm:text-lg font-medium text-white">{displayInfo.teams[0].name}</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{displayInfo.teams[0].score || '0'}</p>
            </div>
            <div className="mx-2 text-xs text-slate-400 font-semibold">VS</div>
            <div className="flex-1 text-center">
              <p className="text-base sm:text-lg font-medium text-white">{displayInfo.teams[1]?.name || 'Team 2'}</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{displayInfo.teams[1]?.score || '0'}</p>
            </div>
          </div>
          
          {/* Winner Section */}
          {displayInfo.winner && (
            <div className="flex items-center gap-2 p-3 bg-green-500/20 border-t border-green-500/20">
              <Trophy className="h-5 w-5 text-green-400 ml-2" />
              <p className="text-sm sm:text-base text-white">
                <span className="font-medium">Winner:</span> {displayInfo.winner}
              </p>
            </div>
          )}
          
          {/* Man of the Match Section */}
          {displayInfo.manOfMatch && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/20 border-t border-blue-500/20">
              <User className="h-5 w-5 text-blue-400 ml-2" />
              <p className="text-sm sm:text-base text-white">
                <span className="font-medium">Player of the match:</span> {displayInfo.manOfMatch}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Player statistics */}
      <div>
        <PlayerStatistics displayInfo={displayInfo} />
      </div>
    </ResponsiveContainer>
  );
};

export default MatchOverview;
