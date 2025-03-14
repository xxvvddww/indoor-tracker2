
import React from 'react';
import { DisplayableMatchInfo } from './types';
import { MatchDetails } from '../../types/cricket';
import MatchWinner from './MatchWinner';
import PlayerStatistics from './PlayerStatistics';
import MatchHeader from './MatchHeader';
import DataExtractor from './DataExtractor';
import MatchTeams from './MatchTeams';
import { ResponsiveContainer } from '../ui/responsive-container';
import { AlertCircle, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MatchOverviewProps {
  displayInfo: DisplayableMatchInfo;
  matchData: MatchDetails | null;
}

export const MatchOverview: React.FC<MatchOverviewProps> = ({ displayInfo, matchData }) => {
  // Show message if we don't have match data
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

  // This component extracts data from matchData and updates displayInfo
  return (
    <ResponsiveContainer spacing="md">
      {/* This component extracts data from matchData and updates displayInfo */}
      <DataExtractor displayInfo={displayInfo} matchData={matchData} />
      
      {/* Match Info Card - Always show this card with whatever info we have */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Match date and venue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayInfo.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">{displayInfo.date}</span>
                  {displayInfo.time && (
                    <span className="text-sm text-muted-foreground">at {displayInfo.time}</span>
                  )}
                </div>
              )}
              
              {displayInfo.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{displayInfo.venue}</span>
                </div>
              )}
            </div>
            
            {/* Match result/winner */}
            {displayInfo.winner && <MatchWinner displayInfo={displayInfo} />}
            
            {/* Match info header with tournament, type, etc */}
            {(displayInfo.tournament || displayInfo.matchType) && (
              <MatchHeader displayInfo={displayInfo} />
            )}

            {/* If we have no useful info, show a message, but only in this section */}
            {!displayInfo.date && !displayInfo.venue && !displayInfo.winner && 
             !displayInfo.tournament && !displayInfo.matchType && (
              <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-md space-y-2 text-center">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Limited match information available
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Team information - Show if teams exist */}
      {displayInfo.teams && displayInfo.teams.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <MatchTeams displayInfo={displayInfo} />
          </CardContent>
        </Card>
      )}
      
      {/* Player statistics - Always show this card */}
      <Card>
        <CardContent className="pt-6">
          <PlayerStatistics displayInfo={displayInfo} />
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
};

export default MatchOverview;
