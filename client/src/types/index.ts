export type TeamKey = "teamA" | "teamB";

export type Team = {
  name: string;
  players: Player[];
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

  playersStats: PlayerMatchStats[];

  extras: Extras;

  thisOver: string[];
};

export type ScoringStore = {
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
