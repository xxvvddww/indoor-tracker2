
import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import PlayerStatistics from './PlayerStatistics';
import DataExtractor from './DataExtractor';
import { ResponsiveContainer } from '../ui/responsive-container';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
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
        <div className="w-full overflow-hidden rounded-lg bg-slate-900 shadow-lg mb-4">
          {/* Match Score Section */}
          {displayInfo.teams.length >= 2 && (
            <div className="p-4">
              <div className="flex items-center mb-1">
                <div className="flex-1">
                  <span className="text-green-400 font-medium">{displayInfo.teams[0].name}</span>
                  {displayInfo.teams[0].isWinner && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-900 text-green-400 rounded">Winner</span>
                  )}
                </div>
                <div className="text-xl text-white font-bold">{displayInfo.teams[0].score || "0"}</div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1">
                  <span className="text-gray-300 font-medium">{displayInfo.teams[1].name}</span>
                  {displayInfo.teams[1].isWinner && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-900 text-green-400 rounded">Winner</span>
                  )}
                </div>
                <div className="text-xl text-white font-bold">{displayInfo.teams[1].score || "0"}</div>
              </div>
            </div>
          )}
          
          {/* Result Section */}
          {displayInfo.result && (
            <div className="px-4 py-2 border-t border-slate-700">
              <p className="text-sm text-white">
                <span className="text-gray-400">Result:</span> {displayInfo.result}
              </p>
            </div>
          )}
          
          {/* Man of the Match Section */}
          {displayInfo.manOfMatch && (
            <div className="px-4 py-2 border-t border-slate-700">
              <p className="text-sm text-white">
                <span className="text-gray-400">Player of the Match:</span> {displayInfo.manOfMatch}
                {displayInfo.teams && displayInfo.teams.length > 0 && displayInfo.teams[0].isWinner && (
                  <span className="text-xs text-gray-400 ml-1">({displayInfo.teams[0].name})</span>
                )}
                {displayInfo.teams && displayInfo.teams.length > 1 && displayInfo.teams[1].isWinner && (
                  <span className="text-xs text-gray-400 ml-1">({displayInfo.teams[1].name})</span>
                )}
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
