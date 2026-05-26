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
    return { ...result, runsTotal: num, batterRuns: num };
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

// ---------- Swap helper ----------
const swapIds = (a: string, b: string): [string, string] => [b, a];

interface AddBallOptions {
  newBatsmanId?: string;
  wicketType?: string;
  newBatsmanName?: string;
  didBattersCross?: boolean; // for run-out logic
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
  const { newBatsmanId, wicketType, newBatsmanName, didBattersCross } = options;
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
    const penalty = Number(matchRules.wide.runs ?? 1) || 1;
    const enteredRuns = parsed.runsTotal;
    parsed.runsTotal = enteredRuns + penalty;
    parsed.extraRuns = parsed.runsTotal;
    parsed.isLegal = matchRules.wide.reBall ? false : true;
  }

  // --- Select innings and capture initial state ---
  const currentInningsKey =
    state.currentInnings === 1 ? "innings1" : "innings2";
  const innings: Innings = { ...state[currentInningsKey] };

  // ---------- INNINGS OVERFLOW GUARD ----------
  const battingTeamKey = innings.battingTeam;
  const battingTeam = battingTeamKey === "teamA" ? state.teamA : state.teamB;
  const maxWickets = battingTeam.playersIds.length - 1; // all out when this many fall

  if (innings.wickets >= maxWickets) {
    throw new Error("Innings complete: all out");
  }

  const totalLegalBalls = innings.overs * 6 + innings.ballsInOver;
  const maxBalls = state.maxOvers * 6;
  if (state.maxOvers > 0 && totalLegalBalls >= maxBalls) {
    throw new Error("Innings complete: overs limit reached");
  }
  // -------------------------------------------

  // Capture current positions for scorecard (BEFORE any mutations)
  const currentOverNumber = innings.overs;
  const currentBallInOver = innings.ballsInOver; // 0-based

  // Local IDs – we will manipulate these throughout the function
  let strikerId = innings.strikerId!;
  let nonStrikerId = innings.nonStrikerId!;
  const bowlerId = innings.currentBowlerId!;

  // Get player objects for stat updates
  const players = { ...state.players };
  const striker: Player = structuredClone(players[strikerId]);
  const nonStriker: Player = structuredClone(players[nonStrikerId]);
  const bowler: Player = structuredClone(players[bowlerId]);

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

  // Ball counting (legal deliveries)
  if (parsed.isLegal) {
    innings.ballsInOver += 1;
  }
  innings.thisOver = [...innings.thisOver, ballResult];

  // --- Batsman stats (striker only) ---
  if (parsed.isLegal) {
    striker.stats.batting.balls += 1;
  }
  striker.stats.batting.runs += parsed.batterRuns;
  if (parsed.batterRuns === 4) striker.stats.batting.fours += 1;
  if (parsed.batterRuns === 6) striker.stats.batting.sixes += 1;

  // --- Wicket handling ---
  let wicketJustFell = false;
  let inningsEnded = false;
  if (parsed.isWicket) {
    wicketJustFell = true;
    innings.wickets += 1;
    striker.stats.batting.isOut = true;
    striker.stats.batting.dismissalType = wicketType ?? "unknown";

    const isAllOut = innings.wickets >= maxWickets;
    inningsEnded = isAllOut;

    if (!isAllOut) {
      if (!newBatsmanId) {
        throw new Error("newBatsmanId is required when a wicket falls");
      }
      if (!players[newBatsmanId]) {
        throw new Error(
          `New batsman ${newBatsmanId} does not exist in players`,
        );
      }
    }

    if (wicketType === "run out") {
      if (didBattersCross === undefined) {
        throw new Error("didBattersCross must be provided for run out");
      }
      if (!isAllOut) {
        const nextBatsman = newBatsmanId as string;
        if (didBattersCross) {
          strikerId = nonStrikerId;
          nonStrikerId = nextBatsman;
        } else {
          strikerId = nextBatsman;
        }
      } else {
        strikerId = "";
        nonStrikerId = "";
      }
    } else {
      // Bowler wicket
      if (!isAllOut) {
        strikerId = newBatsmanId as string;
      } else {
        strikerId = "";
        nonStrikerId = "";
      }
      bowler.stats.bowling.wickets += 1;
    }
  }
  // --- Bowler stats ---
  const bowlerRuns = bowlerRunsConceded(parsed);
  bowler.stats.bowling.runs += bowlerRuns;

  if (parsed.isLegal) {
    bowler.stats.bowling.balls += 1;

    if (bowler.stats.bowling.balls >= 6) {
      // Over completed – capture thisOver BEFORE clearing
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
      innings.ballsInOver = 0;

      overCompleteFlag = true;
      overRunsValue = overRuns;
    }
  }

  // --- Strike rotation (correct cricket logic) ---
  // Determine how many runs were physically run
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

  const shouldRotate = runsRun % 2 === 1;

  // Apply rotation for this ball (only if no wicket, because wicket already rearranged)
  if (!wicketJustFell && shouldRotate) {
    [strikerId, nonStrikerId] = swapIds(strikerId, nonStrikerId);
  }

  // Over-end swap (always, after ball rotation)
  if (overCompleteFlag && !inningsEnded) {
    [strikerId, nonStrikerId] = swapIds(strikerId, nonStrikerId);
  }

  // --- Update innings with final IDs ---
  innings.strikerId = strikerId || null;
  innings.nonStrikerId = nonStrikerId || null;

  // --- Recalculate strike rate for BOTH batsmen ---
  const calcSR = (runs: number, balls: number) =>
    balls > 0 ? Number(((runs / balls) * 100).toFixed(2)) : 0;

  striker.stats.batting.strikeRate = calcSR(
    striker.stats.batting.runs,
    striker.stats.batting.balls,
  );
  nonStriker.stats.batting.strikeRate = calcSR(
    nonStriker.stats.batting.runs,
    nonStriker.stats.batting.balls,
  );

  const oversBowled =
    bowler.stats.bowling.overs + bowler.stats.bowling.balls / 6;
  bowler.stats.bowling.economy = oversBowled
    ? Number((bowler.stats.bowling.runs / oversBowled).toFixed(2))
    : 0;

  // --- Commit player objects back to players map ---
  players[striker.id] = striker;
  players[nonStriker.id] = nonStriker;
  players[bowler.id] = bowler;

  // --- Build ball detail for scorecard ---
  const ballDetail: BallDetail = {
    ballIndex: 0, // set by scorecard store
    overNumber: currentOverNumber,
    ballInOver: currentBallInOver,
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
    newBatsmanName: parsed.isWicket ? newBatsmanName : undefined,
    facingStrikerId: striker.id, // the batter who faced the ball (original striker)
    facingNonStrikerId: nonStriker.id, // the original non-striker
    bowlerId: bowler.id,
    bowlerRuns: bowlerRuns,
    isBowlerWicket: parsed.isWicket && wicketType !== "run out",
    overComplete: overCompleteFlag,
    overRuns: overCompleteFlag ? overRunsValue : undefined,
    facingStrikerName: striker.name,
    facingNonStrikerName: nonStriker.name,
    bowlerName: bowler.name,
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
