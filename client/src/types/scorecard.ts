import { MatchRules, Extras } from "@/types";

export type BallDetail = {
  ballIndex?: number;
  overNumber: number;
  ballInOver: number;
  result: string;
  runs: number;
  batterRuns: number;
  extraRuns: number;
  extraType: "wide" | "noBall" | "bye" | "legBye" | null;
  isWicket: boolean;
  isLegal: boolean;
  wicketType?: string;
  fielderId?: string;
  fielderName?: string;
  batsmanOutId?: string;
  newBatsmanId?: string;
  facingStrikerId: string;
  facingNonStrikerId: string;
  bowlerId: string;
  bowlerRuns: number;
  isBowlerWicket: boolean;
  overComplete: boolean;
  overRuns?: number;
  facingStrikerName: string;
  facingNonStrikerName: string;
  bowlerName: string;
  newBatsmanName?: string;
  dismissalString?: string;
};

export type BattingScorecardEntry = {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissal?: string;
  dismissalType?: string;
  fielderIds?: string[];
};

export type BowlingScorecardEntry = {
  playerId: string;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  legalBalls: number;
};

export type FallOfWicket = {
  wicketNumber: number;
  runsAt: number;
  partnershipRuns: number;
  oversAt: string; // "5.3"
  batsmanOutId: string;
};

export type InningsScorecard = {
  battingTeamId: string;
  battingTeamName: string;
  totalRuns: number;
  wickets: number;
  totalOvers: number; // e.g. 20.0 (could be stored as {overs, balls})
  extras: Extras;
  batsmen: BattingScorecardEntry[];
  bowlers: BowlingScorecardEntry[];
  fallOfWickets: FallOfWicket[];
  balls: BallDetail[]; // complete ball‑by‑ball log
  currentPartnership: number;
};

export type MatchScorecard = {
  id: string; // unique ID for history
  teamA: string;
  teamB: string;
  tossWonBy: string;
  optedTo: string;
  matchRules: MatchRules;
  maxOvers: number; // from setup
  innings: InningsScorecard[]; // length 1 or 2
  result?: string; // e.g. "Team A won by 5 wickets"
  startTime: string;
  endTime?: string;
};
