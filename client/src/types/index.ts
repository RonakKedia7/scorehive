export type OptedTo = "bat" | "bowl";

export type MatchRules = {
  playersPerTeam: string;

  noBall: {
    enabled: boolean;
    reBall: boolean;
    runs: string;
  };

  wide: {
    enabled: boolean;
    reBall: boolean;
    runs: string;
  };
};

export type InitialMatchSetupState = {
  teamA: string;
  teamB: string;

  tossWonBy: string;
  optedTo: "" | OptedTo;

  overs: string;

  matchRules: MatchRules;

  setTeamA: (team: string) => void;
  setTeamB: (team: string) => void;

  setTossWonBy: (team: string) => void;
  setOptedTo: (option: OptedTo) => void;

  setOvers: (overs: string) => void;

  setPlayersPerTeam: (players: string) => void;

  toggleNoBall: (enabled: boolean) => void;
  setNoBallReBall: (reBall: boolean) => void;
  setNoBallRuns: (runs: string) => void;

  toggleWide: (enabled: boolean) => void;
  setWideReBall: (reBall: boolean) => void;
  setWideRuns: (runs: string) => void;

  resetMatchSetup: () => void;
};

export type TeamKey = "teamA" | "teamB";

export type Team = {
  name: string;
  playersIds: string[];
};

export type Player = {
  id: string;
  name: string;
  stats: PlayerMatchStats;
};

export type PlayerMatchStats = {
  playerId: string;

  batting: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
    isOut: boolean;
    dismissalType?: string;
  };

  bowling: {
    overs: number;
    balls: number;
    maidens: number;
    runs: number;
    wickets: number;
    economy: number;
  };
};

export type Extras = {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
};

export type Innings = {
  battingTeam: TeamKey | null;
  bowlingTeam: TeamKey | null;

  totalRuns: number;
  wickets: number;

  overs: number;
  balls: number;

  strikerId: string | null;
  nonStrikerId: string | null;

  currentBowlerId: string | null;

  extras: Extras;

  thisOver: string[];
};

export type ScoringStore = {
  players: Record<string, Player>;

  teamA: Team;
  teamB: Team;

  currentInnings: 1 | 2;

  innings1: Innings;
  innings2: Innings;

  initializeMatch: (params: {
    teamAName: string;
    teamBName: string;

    battingTeam: TeamKey;

    strikerName: string;
    nonStrikerName: string;
    bowlerName: string;
  }) => void;

  resetScoringStore: () => void;
};
