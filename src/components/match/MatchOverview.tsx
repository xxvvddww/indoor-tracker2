
import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import PlayerStatistics from './PlayerStatistics';
import DataExtractor from './DataExtractor';
import { ResponsiveContainer } from '../ui/responsive-container';
import { AlertCircle, Calendar, MapPin, Trophy, Users } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";

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

  return (
    <ResponsiveContainer spacing="md">
      {/* This component extracts data from matchData and updates displayInfo */}
      <DataExtractor displayInfo={displayInfo} matchData={matchData} />
      
      {/* Display summary information at the top */}
      <div className="space-y-4 w-full">
        {/* Match summary section */}
        <Card className="p-4">
          <div className="space-y-4">
            {/* Match date and venue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayInfo.date ? (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">{displayInfo.date}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Date not available</span>
                </div>
              )}
              
              {displayInfo.venue ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{displayInfo.venue}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Venue not available</span>
                </div>
              )}
            </div>
            
            {/* Match result */}
            {displayInfo.winner ? (
              <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-md border border-amber-500/20">
                <Trophy className="h-4 w-4 text-amber-500" />
                <p className="text-sm">
                  <span className="font-medium">Winner:</span> {displayInfo.winner}
                  {displayInfo.result && displayInfo.result !== `${displayInfo.winner} won` && (
                    <span className="ml-1">({displayInfo.result.replace(`${displayInfo.winner} won`, '').trim()})</span>
                  )}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No result information available
                </p>
              </div>
            )}
            
            {/* Man of the match */}
            {displayInfo.manOfMatch && (
              <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-md border border-amber-500/20">
                <Trophy className="h-4 w-4 text-amber-500" />
                <p className="text-sm">
                  <span className="font-medium">Player of the Match:</span> {displayInfo.manOfMatch}
                </p>
              </div>
            )}
          </div>
        </Card>
        
        {/* Teams information */}
        {displayInfo.teams && displayInfo.teams.length > 0 ? (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Teams</h3>
            </div>
            <div className="space-y-2">
              {displayInfo.teams.map((team, index) => (
                <div key={team.id} className="flex items-center justify-between">
                  <span className="text-sm">{team.name}</span>
                  {displayInfo.winnerId === team.id && (
                    <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full">
                      Winner
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">No team information available</p>
            </div>
          </Card>
        )}
        
        {/* Player statistics */}
        <Card className="p-4">
          <PlayerStatistics displayInfo={displayInfo} />
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default MatchOverview;
