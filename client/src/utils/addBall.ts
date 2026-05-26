import { ScoringStore, Innings, Player, Extras } from "@/types";
import { BallDetail } from "@/types/scorecard";

// ---------- parsing helper ----------
interface ParsedBall {
  runsTotal: number;
  batterRuns: number;
  extraRuns: number;
  extraType: "wide" | "noBall" | "bye" | "legBye" | null;
  isWicket: boolean;
  isLegal: boolean;
}

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
    return { ...result, isWicket: true };
  }

  if (/^\d*W$/.test(ball)) {
    const num = parseInt(ball.slice(0, -1)) || 0;
    return {
      ...result,
      isWicket: true,
      runsTotal: num,
      batterRuns: num,
    };
  }

  const extraMatch = ball.match(/^(\d+)(wd|nb|b|lb)$/);
  if (extraMatch) {
    const num = Number(extraMatch[1]);
    const type = extraMatch[2];

    switch (type) {
      case "wd":
        return {
          ...result,
          runsTotal: num,
          extraRuns: num,
          extraType: "wide",
          isLegal: false,
        };
      case "nb":
        return {
          ...result,
          runsTotal: num,
          extraType: "noBall",
          isLegal: false,
        };
      case "b":
        return {
          ...result,
          runsTotal: num,
          extraRuns: num,
          extraType: "bye",
        };
      case "lb":
        return {
          ...result,
          runsTotal: num,
          extraRuns: num,
          extraType: "legBye",
        };
    }
  }

  if (/^\d+$/.test(ball)) {
    const num = Number(ball);
    return {
      ...result,
      runsTotal: num,
      batterRuns: num,
    };
  }

  throw new Error(`Invalid ball result: ${ball}`);
}

function bowlerRunsConceded(p: ParsedBall): number {
  switch (p.extraType) {
    case "bye":
    case "legBye":
      return 0;
    case "wide":
      return p.extraRuns;
    case "noBall":
      return p.extraRuns + p.batterRuns;
    default:
      return p.batterRuns;
  }
}

interface AddBallOptions {
  newBatsmanId?: string;
  wicketType?: string;
  newBatsmanName?: string;
}

export function addBall(
  state: ScoringStore,
  ballResult: string,
  options: AddBallOptions = {},
): {
  state: Partial<ScoringStore>;
  ballDetail: BallDetail;
  overComplete: boolean;
} {
  const { newBatsmanId, wicketType, newBatsmanName } = options;
  const { matchRules } = state;

  const parsed = parseBallResult(ballResult);

  let overCompleteFlag = false;
  let overRunsValue = 0;

  // Enforce match rules
  if (parsed.extraType === "noBall" && !matchRules.noBall.enabled) {
    throw new Error(
      "No-ball is disabled in match rules. Cannot record a no-ball.",
    );
  }
  if (parsed.extraType === "wide" && !matchRules.wide.enabled) {
    throw new Error("Wide is disabled in match rules. Cannot record a wide.");
  }

  // Adjust for no-ball rules
  if (parsed.extraType === "noBall") {
    const penalty = parseInt(matchRules.noBall.runs, 10) || 1;
    const batterRuns = parsed.runsTotal;
    parsed.runsTotal = batterRuns + penalty;
    parsed.batterRuns = batterRuns;
    parsed.extraRuns = penalty;
    parsed.isLegal = matchRules.noBall.reBall ? false : true;
  }

  // Adjust for wide rules
  if (parsed.extraType === "wide") {
    const penalty = parseInt(matchRules.wide.runs, 10) || 0;
    const enteredRuns = parsed.runsTotal;
    parsed.runsTotal = enteredRuns + penalty;
    parsed.extraRuns = parsed.runsTotal;
    parsed.isLegal = matchRules.wide.reBall ? false : true;
  }

  const currentInningsKey =
    state.currentInnings === 1 ? "innings1" : "innings2";
  const innings: Innings = { ...state[currentInningsKey] };

  const players = { ...state.players };
  const striker: Player = { ...players[innings.strikerId!] };
  const nonStriker: Player = { ...players[innings.nonStrikerId!] };
  const bowler: Player = { ...players[innings.currentBowlerId!] };

  // --- Update innings totals and extras ---
  innings.totalRuns += parsed.runsTotal;

  if (parsed.extraType) {
    const extras: Extras = { ...innings.extras };
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

  // Ball counting
  if (parsed.isLegal) {
    innings.balls += 1;
  }
  innings.thisOver = [...innings.thisOver, ballResult];

  // --- Batsman stats ---
  if (parsed.isLegal) {
    striker.stats.batting.balls += 1;
  }
  striker.stats.batting.runs += parsed.batterRuns;
  if (parsed.batterRuns === 4) striker.stats.batting.fours += 1;
  if (parsed.batterRuns === 6) striker.stats.batting.sixes += 1;

  // --- Wicket ---
  if (parsed.isWicket) {
    innings.wickets += 1;
    striker.stats.batting.isOut = true;
    striker.stats.batting.dismissalType = wicketType ?? "unknown";

    if (!newBatsmanId) {
      throw new Error("newBatsmanId is required when a wicket falls");
    }
    innings.strikerId = newBatsmanId;

    if (wicketType !== "run out") {
      bowler.stats.bowling.wickets += 1;
    }
  }

  // --- Bowler stats ---
  const bowlerRuns = bowlerRunsConceded(parsed);
  bowler.stats.bowling.runs += bowlerRuns;

  if (parsed.isLegal) {
    bowler.stats.bowling.balls += 1;

    if (bowler.stats.bowling.balls === 6) {
      // Over completed – capture data BEFORE clearing thisOver
      const completedOverBalls = [...innings.thisOver];
      const overRuns = completedOverBalls.reduce(
        (sum, b) => sum + bowlerRunsConceded(parseBallResult(b)),
        0,
      );

      bowler.stats.bowling.overs += 1;
      bowler.stats.bowling.balls = 0;
      if (overRuns === 0) bowler.stats.bowling.maidens += 1;

      innings.thisOver = [];
      innings.overs += 1;
      innings.balls = 0;

      overCompleteFlag = true;
      overRunsValue = overRuns;
    }
  }

  // --- Strike rotation ---
  const rotationRuns =
    parsed.extraType === "bye" || parsed.extraType === "legBye"
      ? parsed.extraRuns
      : parsed.runsTotal;

  if (rotationRuns % 2 === 1) {
    [innings.strikerId, innings.nonStrikerId] = [
      innings.nonStrikerId,
      innings.strikerId,
    ];
  }

  // --- Recalculate rates ---
  striker.stats.batting.strikeRate =
    striker.stats.batting.balls > 0
      ? (striker.stats.batting.runs / striker.stats.batting.balls) * 100
      : 0;

  const oversBowled =
    bowler.stats.bowling.overs + bowler.stats.bowling.balls / 6;
  bowler.stats.bowling.economy = oversBowled
    ? bowler.stats.bowling.runs / oversBowled
    : 0;

  // --- Commit player changes ---
  players[striker.id] = striker;
  players[nonStriker.id] = nonStriker;
  players[bowler.id] = bowler;

  if (parsed.isWicket && newBatsmanId && !players[newBatsmanId]) {
    console.warn(`Player ${newBatsmanId} not found in store`);
  }

  // --- Build ball detail for scorecard ---
  const ballDetail: BallDetail = {
    ballIndex: 0, // set by scorecard store
    overNumber: innings.overs - (overCompleteFlag ? 1 : 0),
    ballInOver: overCompleteFlag ? 5 : innings.balls - 1,
    result: ballResult,
    runs: parsed.runsTotal,
    batterRuns: parsed.batterRuns,
    extraRuns: parsed.extraRuns,
    extraType: parsed.extraType,
    isWicket: parsed.isWicket,
    isLegal: parsed.isLegal,
    wicketType: wicketType,
    batsmanOutId: parsed.isWicket ? striker.id : undefined,
    newBatsmanId: parsed.isWicket ? newBatsmanId : undefined,
    strikerId: striker.id,
    nonStrikerId: nonStriker.id,
    bowlerId: bowler.id,
    bowlerRuns: bowlerRuns,
    isBowlerWicket: parsed.isWicket && wicketType !== "run out",
    overComplete: overCompleteFlag,
    overRuns: overCompleteFlag ? overRunsValue : undefined,
    strikerName: striker.name,
    nonStrikerName: nonStriker.name,
    bowlerName: bowler.name,
    newBatsmanName: parsed.isWicket ? newBatsmanName : undefined,
  };

  return {
    state: {
      players,
      [currentInningsKey]: innings,
    },
    ballDetail,
    overComplete: overCompleteFlag,
  };
}
