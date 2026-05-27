import { ScoringStore, Innings, Player } from "@/types";
import { BallDetail } from "@/types/scorecard";
import {
  parseBallResult,
  applyMatchRules,
  applyExtras,
  applyBattingStats,
  handleWicket,
  applyBowlingStats,
  resolveStrikeRotation,
  buildBallDetail,
  bowlerRunsConceded,
  WicketType,
} from "./ballHelpers";

export interface AddBallOptions {
  newBatsmanId?: string;
  wicketType?: WicketType;
  newBatsmanName?: string;
  didBattersCross?: boolean;
  outType?: "striker" | "nonStriker";
  fielderId?: string;
  fielderName?: string;
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
  // 1. Parse and apply match rules
  const parsed = parseBallResult(ballResult);

  if (parsed.extraType === "noBall" && !state.matchRules.noBall.enabled) {
    throw new Error("No-ball is disabled...");
  }
  if (parsed.extraType === "wide" && !state.matchRules.wide.enabled) {
    throw new Error("Wide is disabled...");
  }

  applyMatchRules(parsed, state.matchRules);

  // 2. Validate that enabled extras are respected
  if (parsed.extraType === "noBall" && !state.matchRules.noBall.enabled) {
    throw new Error(
      "No-ball is disabled in match rules. Cannot record a no-ball.",
    );
  }
  if (parsed.extraType === "wide" && !state.matchRules.wide.enabled) {
    throw new Error("Wide is disabled in match rules. Cannot record a wide.");
  }

  // 3. Identify current innings
  const currentInningsKey =
    state.currentInnings === 1 ? "innings1" : "innings2";
  const innings: Innings = { ...state[currentInningsKey] };

  // 4. Boundary checks (all out / overs limit)
  const maxWickets = parseInt(state.matchRules.playersPerTeam, 10) - 1;
  const potentialWickets = innings.wickets + (parsed.isWicket ? 1 : 0);
  if (potentialWickets > maxWickets) {
    throw new Error("Innings complete: all out");
  }
  const totalLegalBalls = innings.overs * 6 + innings.ballsInOver;
  const maxBalls = state.maxOvers * 6;
  if (state.maxOvers > 0 && totalLegalBalls >= maxBalls) {
    throw new Error("Innings complete: overs limit reached");
  }

  // 5. Capture current positions (for scorecard)
  const currentOverNumber = innings.overs;
  const currentBallInOver = innings.ballsInOver;

  // 6. Local mutable copies
  let strikerId = innings.strikerId!;
  let nonStrikerId = innings.nonStrikerId!;
  const bowlerId = innings.currentBowlerId!;

  const players = { ...state.players };
  const striker: Player = structuredClone(players[strikerId]);
  const nonStriker: Player = structuredClone(players[nonStrikerId]);
  const bowler: Player = structuredClone(players[bowlerId]);

  // 7. Update innings totals and extras
  applyExtras(innings, parsed);

  // 8. Count legal deliveries
  if (parsed.isLegal) {
    innings.ballsInOver += 1;
  }
  innings.thisOver = [...innings.thisOver, parsed];

  // 9. Batting stats
  applyBattingStats(striker, parsed);

  // 10. Wicket handling (if any)
  let wicketResult = null;
  if (parsed.isWicket) {
    wicketResult = handleWicket({
      innings,
      striker,
      nonStriker,
      bowler,
      parsed,
      options,
      matchRules: state.matchRules,
      strikerId,
      nonStrikerId,
    });
    // Apply the new batting order from wicket handler
    strikerId = wicketResult.newStrikerId;
    nonStrikerId = wicketResult.newNonStrikerId;
  }

  // 11. Bowling stats and over completion
  const bowlingResult = applyBowlingStats(bowler, parsed, innings);
  const overComplete = bowlingResult.overComplete;
  const overRuns = bowlingResult.overRuns;

  // 12.Always resolve strike rotation (over-end swap must happen even after wickets)
  const rotation = resolveStrikeRotation({
    parsed,
    matchRules: state.matchRules,
    wicketFell: parsed.isWicket,
    overComplete,
    inningsEnded: wicketResult?.inningsEnded || false,
    strikerId,
    nonStrikerId,
  });
  strikerId = rotation.newStrikerId;
  nonStrikerId = rotation.newNonStrikerId;

  // 13. Save final IDs back to innings
  innings.strikerId = strikerId || null;
  innings.nonStrikerId = nonStrikerId || null;

  // 14. Recalculate strike rates and economy
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

  // 15. Commit updated players
  players[striker.id] = striker;
  players[nonStriker.id] = nonStriker;
  players[bowler.id] = bowler;

  // 16. Build ball detail for scorecard
  const ballDetail = buildBallDetail(
    ballResult,
    parsed,
    currentOverNumber,
    currentBallInOver,
    striker,
    nonStriker,
    bowler,
    bowlerRunsConceded(parsed),
    wicketResult,
    options,
    overComplete,
    overRuns,
  );

  return {
    state: {
      players,
      [currentInningsKey]: innings,
    },
    ballDetail,
    overComplete,
  };
}
