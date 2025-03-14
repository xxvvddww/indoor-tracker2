
import React, { useEffect } from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import MatchWinner from './MatchWinner';
import PlayerStatistics from './PlayerStatistics';
import MatchHeader from './MatchHeader';
import DataExtractor from './DataExtractor';
import MatchTeams from './MatchTeams';
import { ResponsiveContainer } from '../ui/responsive-container';
import { AlertCircle, Calendar, MapPin, Trophy, Users } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';

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

  // Show message if we have match data but no meaningful display information
  const hasNoUsefulInfo = matchData && 
    (!displayInfo.teams || displayInfo.teams.length === 0) && 
    !displayInfo.date && 
    !displayInfo.venue && 
    !displayInfo.winner && 
    !displayInfo.manOfMatch;

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
              {displayInfo.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">{displayInfo.date}</span>
                </div>
              )}
              
              {displayInfo.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{displayInfo.venue}</span>
                </div>
              )}
            </div>
            
            {/* Match result */}
            {displayInfo.winner && (
              <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-md border border-amber-500/20">
                <Trophy className="h-4 w-4 text-amber-500" />
                <p className="text-sm">
                  <span className="font-medium">Winner:</span> {displayInfo.winner}
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
                  {team.isWinner && (
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
