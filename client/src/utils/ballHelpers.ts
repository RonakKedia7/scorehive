import { ScoringStore, Innings, Player, Extras } from "@/types";
import { BallDetail } from "@/types/scorecard";

// ---------- Types ----------
export interface ParsedBall {
  runsTotal: number;
  batterRuns: number;
  extraRuns: number;
  extraType: "wide" | "noBall" | "bye" | "legBye" | null;
  isWicket: boolean;
  isLegal: boolean;
}

export type WicketType =
  | "bowled"
  | "caught"
  | "lbw"
  | "run out"
  | "stumped"
  | "hit wicket"
  | "retired hurt"
  | "retired out"
  | "obstructing the field";

// Dismissals where the bowler DOES NOT get credit
const nonBowlerWickets: WicketType[] = [
  "run out",
  "retired hurt",
  "retired out",
  "obstructing the field",
];

export const bowlerGetsWicketTypes = (wicketType?: WicketType): boolean => {
  return !!wicketType && !nonBowlerWickets.includes(wicketType);
};

// ---------- Parsing ----------
export function parseBallResult(ball: string): ParsedBall {
  let result: ParsedBall = {
    runsTotal: 0,
    batterRuns: 0,
    extraRuns: 0,
    extraType: null,
    isWicket: false,
    isLegal: true,
  };

  if (ball === "W") {
    return { ...result, isWicket: true, isLegal: true };
  }

  if (/^\d*W$/.test(ball)) {
    const num = parseInt(ball.slice(0, -1)) || 0;
    return {
      ...result,
      isWicket: true,
      runsTotal: num,
      batterRuns: num,
      isLegal: true,
    };
  }

  const extraMatch = ball.match(/^(\d+)(wd|nb|b|lb)$/);
  if (extraMatch) {
    const runsOffBat = Number(extraMatch[1]); // e.g., 2 from "2wd"
    const type = extraMatch[2];

    switch (type) {
      case "wd":
        return {
          runsTotal: 0, // will be set in applyMatchRules
          batterRuns: runsOffBat,
          extraRuns: 0, // will be set in applyMatchRules
          extraType: "wide",
          isWicket: false,
          isLegal: false,
        };
      case "nb":
        return {
          runsTotal: 0,
          batterRuns: runsOffBat,
          extraRuns: 0,
          extraType: "noBall",
          isWicket: false,
          isLegal: false,
        };
      // for "b" and "lb": no penalty, so runsTotal = runsOffBat, extraRuns = runsOffBat, batterRuns = 0
      case "b":
        return {
          runsTotal: runsOffBat,
          batterRuns: 0,
          extraRuns: runsOffBat,
          extraType: "bye",
          isWicket: false,
          isLegal: true,
        };
      case "lb":
        return {
          runsTotal: runsOffBat,
          batterRuns: 0,
          extraRuns: runsOffBat,
          extraType: "legBye",
          isWicket: false,
          isLegal: true,
        };
    }
  }

  if (/^\d+$/.test(ball)) {
    const num = Number(ball);
    return { ...result, runsTotal: num, batterRuns: num, isLegal: true };
  }

  throw new Error(`Invalid ball result: ${ball}`);
}

export function bowlerRunsConceded(p: ParsedBall): number {
  switch (p.extraType) {
    case "bye":
    case "legBye":
      return 0;
    case "wide":
    case "noBall":
      return p.extraRuns + p.batterRuns;
    default:
      return p.batterRuns;
  }
}

export const swapIds = (a: string, b: string): [string, string] => [b, a];

// ---------- Rule application ----------
export function applyMatchRules(
  parsed: ParsedBall,
  matchRules: ScoringStore["matchRules"],
): void {
  if (parsed.extraType === "noBall" && matchRules.noBall.enabled) {
    const penalty = parseInt(matchRules.noBall.runs, 10) || 1;
    parsed.extraRuns = penalty;
    parsed.runsTotal = parsed.batterRuns + penalty;
    parsed.isLegal = !matchRules.noBall.reBall;
  }
  if (parsed.extraType === "wide" && matchRules.wide.enabled) {
    const penalty = Number(matchRules.wide.runs ?? 1) || 1;
    parsed.extraRuns = penalty;
    parsed.runsTotal = parsed.batterRuns + penalty;
    parsed.isLegal = !matchRules.wide.reBall;
  }
}

// ---------- Extras ----------
export function applyExtras(innings: Innings, parsed: ParsedBall): void {
  innings.totalRuns += parsed.runsTotal;
  if (parsed.extraType) {
    const extras = { ...innings.extras };
    switch (parsed.extraType) {
      case "wide":
        extras.wides += parsed.extraRuns;
        break;
      case "noBall":
        extras.noBalls += parsed.extraRuns;
        break;
      case "bye":
        extras.byes += parsed.extraRuns;
        break;
      case "legBye":
        extras.legByes += parsed.extraRuns;
        break;
    }
    innings.extras = extras;
  }
}

// ---------- Batting stats ----------
export function applyBattingStats(striker: Player, parsed: ParsedBall): void {
  if (parsed.isLegal || parsed.extraType === "noBall") {
    striker.stats.batting.balls += 1;
  }
  striker.stats.batting.runs += parsed.batterRuns;
  if (parsed.batterRuns === 4) striker.stats.batting.fours += 1;
  if (parsed.batterRuns === 6) striker.stats.batting.sixes += 1;
}

// ---------- Wicket handling (fixed) ----------
export interface WicketContext {
  innings: Innings;
  striker: Player;
  nonStriker: Player;
  bowler: Player;
  parsed: ParsedBall;
  options: {
    newBatsmanId?: string;
    wicketType?: WicketType;
    newBatsmanName?: string;
    didBattersCross?: boolean;
    outType?: "striker" | "nonStriker";
    fielderId?: string;
    fielderName?: string;
  };
  matchRules: ScoringStore["matchRules"];
  strikerId: string;
  nonStrikerId: string;
}

export interface WicketResult {
  wicketJustFell: boolean;
  inningsEnded: boolean;
  batsmanOutId?: string;
  newStrikerId: string;
  newNonStrikerId: string;
  dismissalString: string;
}

export function handleWicket(ctx: WicketContext): WicketResult {
  const {
    innings,
    striker,
    nonStriker,
    bowler,
    parsed,
    options,
    matchRules,
    strikerId,
    nonStrikerId,
  } = ctx;
  const {
    wicketType,
    newBatsmanId,
    didBattersCross,
    outType,
    fielderId,
    fielderName,
  } = options;

  const maxWickets = parseInt(matchRules.playersPerTeam, 10) - 1;
  innings.wickets += 1;
  const inningsEnded = innings.wickets >= maxWickets;

  let batsmanOutId: string | undefined;
  let newStrikerId = strikerId;
  let newNonStrikerId = nonStrikerId;
  let dismissalString = "";

  const bowlerName = bowler.name;
  // Build dismissal string
  if (wicketType === "caught") {
    dismissalString = fielderName
      ? `c ${fielderName} b ${bowlerName}`
      : `c & b ${bowlerName}`;
  } else if (wicketType === "bowled") {
    dismissalString = `b ${bowlerName}`;
  } else if (wicketType === "stumped") {
    dismissalString = `st ${fielderName} b ${bowlerName}`;
  } else if (wicketType === "run out") {
    dismissalString = `run out (${fielderName})`;
  } else {
    dismissalString = wicketType ?? "out";
  }

  // Dismissals that do NOT require a replacement batsman
  const noReplacementNeeded: WicketType[] = [
    "retired hurt",
    "retired out",
    "obstructing the field",
  ];
  const requiresReplacement =
    !inningsEnded && !noReplacementNeeded.includes(wicketType as WicketType);

  if (requiresReplacement && !newBatsmanId) {
    throw new Error(
      `newBatsmanId is required for wicket type: ${wicketType} (innings not ended)`,
    );
  }

  if (wicketType === "run out") {
    if (didBattersCross === undefined) {
      throw new Error("didBattersCross must be provided for run out");
    }
    const outIsStriker = outType === "striker" || outType === undefined;
    batsmanOutId = outIsStriker ? strikerId : nonStrikerId;

    const outPlayer = outIsStriker ? striker : nonStriker;
    outPlayer.stats.batting.isOut = true;
    outPlayer.stats.batting.dismissalType = wicketType;
    outPlayer.stats.batting.dismissal = dismissalString;
    outPlayer.stats.batting.fielderIds = fielderId ? [fielderId] : [];

    if (!inningsEnded && requiresReplacement) {
      const nextBatsmanId = newBatsmanId!;
      if (outIsStriker) {
        if (didBattersCross) {
          newStrikerId = nonStrikerId;
          newNonStrikerId = nextBatsmanId;
        } else {
          newStrikerId = nextBatsmanId;
        }
      } else {
        if (didBattersCross) {
          newNonStrikerId = nextBatsmanId;
        } else {
          newNonStrikerId = nextBatsmanId;
        }
      }
    } else if (inningsEnded) {
      newStrikerId = "";
      newNonStrikerId = "";
    }
  } else {
    // Normal wicket – striker out
    batsmanOutId = strikerId;
    striker.stats.batting.isOut = true;
    striker.stats.batting.dismissalType = wicketType ?? "unknown";
    striker.stats.batting.dismissal = dismissalString;
    striker.stats.batting.fielderIds = fielderId ? [fielderId] : [];

    if (!inningsEnded && requiresReplacement) {
      newStrikerId = newBatsmanId!;
    } else if (inningsEnded) {
      newStrikerId = "";
      newNonStrikerId = "";
    }

    if (bowlerGetsWicketTypes(wicketType)) {
      bowler.stats.bowling.wickets += 1;
    }
  }

  return {
    wicketJustFell: true,
    inningsEnded,
    batsmanOutId,
    newStrikerId,
    newNonStrikerId,
    dismissalString,
  };
}

// ---------- Bowling stats (returns over completion data) ----------
export interface BowlingResult {
  overComplete: boolean;
  overRuns: number;
}

export function applyBowlingStats(
  bowler: Player,
  parsed: ParsedBall,
  innings: Innings,
): BowlingResult {
  const bowlerRuns = bowlerRunsConceded(parsed);
  bowler.stats.bowling.runs += bowlerRuns;

  let overComplete = false;
  let overRuns = 0;

  if (parsed.isLegal) {
    bowler.stats.bowling.balls += 1;

    if (bowler.stats.bowling.balls >= 6) {
      const completedOverBalls = [...innings.thisOver];
      overRuns = completedOverBalls.reduce(
        (sum, ball: ParsedBall) => sum + bowlerRunsConceded(ball),
        0,
      );

      bowler.stats.bowling.overs += 1;
      bowler.stats.bowling.balls = 0;
      if (overRuns === 0) bowler.stats.bowling.maidens += 1;

      innings.thisOver = [];
      innings.overs += 1;
      innings.ballsInOver = 0;

      overComplete = true;
    }
  }

  return { overComplete, overRuns };
}

// ---------- Strike rotation (object parameter) ----------
export interface StrikeRotationParams {
  parsed: ParsedBall;
  matchRules: ScoringStore["matchRules"];
  wicketFell: boolean;
  overComplete: boolean;
  inningsEnded: boolean;
  strikerId: string;
  nonStrikerId: string;
}

export function resolveStrikeRotation(params: StrikeRotationParams): {
  newStrikerId: string;
  newNonStrikerId: string;
} {
  let { strikerId, nonStrikerId } = params;
  const { parsed, matchRules, wicketFell, overComplete, inningsEnded } = params;

  // 1. Run‑based rotation (only if no wicket – wicket handler already placed batters)
  if (!wicketFell) {
    let runsRun: number;
    if (parsed.extraType === "wide") {
      const penalty = Number(matchRules.wide.runs ?? 0) || 0;
      runsRun = parsed.runsTotal - penalty;
    } else if (parsed.extraType === "noBall") {
      runsRun = parsed.batterRuns;
    } else if (parsed.extraType === "bye" || parsed.extraType === "legBye") {
      runsRun = parsed.runsTotal;
    } else {
      runsRun = parsed.runsTotal;
    }
    if (runsRun % 2 === 1) {
      [strikerId, nonStrikerId] = swapIds(strikerId, nonStrikerId);
    }
  }

  // 2. Over‑end swap (always, unless innings ended)
  if (overComplete && !inningsEnded) {
    [strikerId, nonStrikerId] = swapIds(strikerId, nonStrikerId);
  }

  return { newStrikerId: strikerId, newNonStrikerId: nonStrikerId };
}

// utils/ballHelpers.ts
export function formatBallResult(ball: ParsedBall): string {
  if (ball.isWicket) {
    return ball.batterRuns > 0 ? `${ball.batterRuns}W` : "W";
  }
  if (ball.extraType) {
    let suffix = "";
    switch (ball.extraType) {
      case "wide":
        suffix = "wd";
        break;
      case "noBall":
        suffix = "nb";
        break;
      case "bye":
        suffix = "b";
        break;
      case "legBye":
        suffix = "lb";
        break;
    }

    const runsToShow =
      ball.extraType === "wide" || ball.extraType === "noBall"
        ? ball.batterRuns
        : ball.runsTotal;
    return `${runsToShow}${suffix}`;
  }
  return `${ball.runsTotal}`;
}
// ---------- Build BallDetail ----------
export function buildBallDetail(
  ballResult: string,
  parsed: ParsedBall,
  currentOverNumber: number,
  currentBallInOver: number,
  striker: Player,
  nonStriker: Player,
  bowler: Player,
  bowlerRuns: number,
  wicketResult: WicketResult | null,
  options: {
    wicketType?: WicketType;
    fielderId?: string;
    fielderName?: string;
    newBatsmanId?: string;
    newBatsmanName?: string;
  },
  overComplete: boolean,
  overRunsValue?: number,
): BallDetail {
  return {
    ballIndex: 0,
    overNumber: currentOverNumber,
    ballInOver: currentBallInOver,
    result: ballResult,
    runs: parsed.runsTotal,
    batterRuns: parsed.batterRuns,
    extraRuns: parsed.extraRuns,
    extraType: parsed.extraType,
    isWicket: parsed.isWicket,
    isLegal: parsed.isLegal,
    wicketType: options.wicketType,
    fielderId: options.fielderId,
    fielderName: options.fielderName,
    batsmanOutId: wicketResult?.batsmanOutId,
    newBatsmanId: parsed.isWicket ? options.newBatsmanId : undefined,
    newBatsmanName: parsed.isWicket ? options.newBatsmanName : undefined,
    facingStrikerId: striker.id,
    facingNonStrikerId: nonStriker.id,
    bowlerId: bowler.id,
    bowlerRuns: bowlerRuns,
    isBowlerWicket: parsed.isWicket && options.wicketType !== "run out",
    overComplete,
    overRuns: overComplete ? overRunsValue : undefined,
    facingStrikerName: striker.name,
    facingNonStrikerName: nonStriker.name,
    bowlerName: bowler.name,
    dismissalString: wicketResult?.dismissalString,
  };
}

// ---------- Utility: format overs for display ----------
export function formatOvers(overs: number, ballsInCurrentOver: number): string {
  return `${overs}.${ballsInCurrentOver}`;
}
