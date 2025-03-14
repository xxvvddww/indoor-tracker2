export interface Fixture {
  Id: string;
  Date: string;
  HomeTeamId: string;
  HomeTeam: string;
  AwayTeamId: string;
  AwayTeam: string;
  VenueId: string;
  Venue: string;
  StartTime: string;
  CompletionStatus: string;
  ScoreDescription: string;
  HomeTeamWon: boolean;
  AwayTeamWon: boolean;
  DivisionId: string;
  DivisionName: string;
  Round: string;
  FixtureType: string;
  // XML API fields
  DateTime?: string;
  VenueName?: string;
  PlayingAreaName?: string;
  HomeTeamScore?: string;
  AwayTeamScore?: string;
}

export interface Player {
  Id: string;
  UserName: string;
  TeamName: string;
  DivisionName: string;
  Games: string;
  Overs: string;
  Wickets: string;
  RunsConceded: string;
  RunsScored: string;
  TimesOut: string;
  Rating: string;
  BallsFaced: string;
  EmailAddressConfirmed: string;
}

export interface Team {
  Id: string;
  Name: string;
  TeamBonusPenaltyRuns?: string;
  Order?: string;
  Points?: string;
  Skins?: string;
  Played?: string;
  Won?: string;
  Lost?: string;
  Drawn?: string;
  RunsFor?: string;
  RunsAgainst?: string;
  QuotientRatio?: string;
  DivisionId?: string;
  DivisionName?: string;
}

export interface MatchConfiguration {
  Team1Id: string;
  Team2Id: string;
  SkinsPerInning: string;
  OversPerSkin: string;
  BallsPerOver: string;
  RunsPerWicket: string;
  Team1BonusPenaltyRuns: string;
  Team2BonusPenaltyRuns: string;
  RunsPerWide: string;
  RunsPerNoBall: string;
  Win: string;
  Lose: string;
  Draw: string;
  Skins: string;
}

export interface Ball {
  OverNumber: string;
  OverId: string;
  BallNumber: string;
  BowlerId: string;
  BowlerTeamId: string;
  BatsmanId: string;
  BatsmanTeamId: string;
  Result: string;
  Extras: string;
  Score: string;
  IsWicket: string;
}

export interface BowlerBatsman {
  Id: string;
  Name: string;
  TeamId: string;
  TeamName: string;
}

export interface Over {
  OverNumber: string;
  BowlerId: string;
  BowlerName: string;
  IsBattingPowerplay: string;
  IsBowlingPowerplay: string;
}

export interface Skin {
  SkinNumber: string;
  Team1Score: string;
  Team1Id: string;
  Team2Score: string;
  Team2Id: string;
  Team1BonusPenaltyRuns: string;
  Team2BonusPenaltyRuns: string;
}

export interface PlayerMatchSummary {
  Name: string;
  RS: string; // Runs Scored
  OB: string; // Overs Bowled
  RC: string; // Runs Conceded
  Wkts: string; // Wickets
  Econ: string; // Economy
  C: string; // Catches
  SR: string; // Strike Rate
  PlayerId: string;
}

export interface TeamMatchSummary {
  name: string;
  player: PlayerMatchSummary[];
}

export interface MatchSummary {
  manOfMatch: string;
  team: TeamMatchSummary[];
}

export interface MatchDetails {
  Configuration: MatchConfiguration;
  Teams: { Team: Team[] };
  Bowlers: { Bowler: BowlerBatsman[] };
  Batsmen: { Batsman: BowlerBatsman[] };
  Overs: { Over: Over[] };
  Balls: { Ball: Ball[] };
  Skins: { Skin: Skin[] };
  MatchSummary: MatchSummary;
}
