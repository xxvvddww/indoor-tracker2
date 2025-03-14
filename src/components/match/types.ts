
import { MatchDetails as MatchDetailsType } from "../../types/cricket";

// Define a simplified type for match display
export type DisplayableMatchInfo = {
  title: string;
  date?: string;
  time?: string;
  venue?: string;
  result?: string;
  matchType?: string;
  tournament?: string;
  umpires?: string[];
  teams?: {
    id: string;
    name: string;
    isWinner?: boolean;
  }[];
  winner?: string;
  winnerId?: string;
  manOfMatch?: string;
  playerStats?: {
    [teamId: string]: {
      name: string;
      players: {
        Name: string;
        RS?: string; // Runs scored
        OB?: string; // Overs bowled
        RC?: string; // Runs conceded
        Wkts?: string; // Wickets
        SR?: string; // Strike rate
        Econ?: string; // Economy
        C?: string; // Contribution metric
        PlayerId?: string; // Player ID
        Id?: string; // Alternative ID field
        TeamId?: string; // Team ID
        TeamName?: string; // Team Name
        [key: string]: any;
      }[];
    };
  };
};
