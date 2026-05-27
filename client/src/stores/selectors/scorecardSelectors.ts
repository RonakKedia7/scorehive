// stores/selectors/scorecardSelectors.ts
import { ScoringStore } from "@/types";
import {
  InningsScorecard,
  BattingScorecardEntry,
  BowlingScorecardEntry,
} from "@/types/scorecard";

// Helper: convert total legal deliveries to overs (e.g., 13 → 2.1)
const ballsToOvers = (totalBalls: number): number => {
  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  return overs + balls * 0.1;
};

export const selectInningsScorecard = (
  state: ScoringStore,
  inningsNum: 1 | 2,
): InningsScorecard | null => {
  const innings = inningsNum === 1 ? state.innings1 : state.innings2;

  // If batting team not set, innings hasn't started
  if (!innings.battingTeam) return null;

  const battingTeamId = innings.battingTeam;
  const bowlingTeamId = innings.bowlingTeam!;

  const battingTeamPlayersIds = state[battingTeamId].playersIds;
  const bowlingTeamPlayersIds = state[bowlingTeamId].playersIds;

  // Build batsmen entries from players' batting stats
  const batsmen: BattingScorecardEntry[] = [];
  for (const playerId of battingTeamPlayersIds) {
    const player = state.players[playerId];
    if (!player) continue;
    const batting = player.stats.batting;
    batsmen.push({
      playerId: player.id,
      name: player.name,
      runs: batting.runs,
      balls: batting.balls,
      fours: batting.fours,
      sixes: batting.sixes,
      strikeRate: batting.strikeRate,
      dismissal: batting.dismissal,
      dismissalType: batting.dismissalType,
      fielderIds: batting.fielderIds,
    });
  }

  // Build bowlers entries from players' bowling stats
  const bowlers: BowlingScorecardEntry[] = [];
  for (const playerId of bowlingTeamPlayersIds) {
    const player = state.players[playerId];
    if (!player) continue;
    const bowling = player.stats.bowling;
    const legalBalls = bowling.overs * 6 + bowling.balls;
    // Only include bowlers who have bowled at least one ball
    if (legalBalls === 0) continue;
    bowlers.push({
      playerId: player.id,
      name: player.name,
      overs: bowling.overs + bowling.balls * 0.1, // display overs
      maidens: bowling.maidens,
      runs: bowling.runs,
      wickets: bowling.wickets,
      economy: bowling.economy,
      legalBalls,
    });
  }

  // Calculate total overs bowled (legal deliveries)
  const totalLegalBalls = innings.overs * 6 + innings.ballsInOver;
  const totalOversDisplay = ballsToOvers(totalLegalBalls);

  return {
    battingTeamId: battingTeamId,
    battingTeamName: state[battingTeamId].name,
    totalRuns: innings.totalRuns,
    wickets: innings.wickets,
    totalOvers: totalOversDisplay,
    extras: innings.extras,
    batsmen,
    bowlers,
    fallOfWickets: innings.fallOfWickets || [],
    balls: innings.ballLog || [], // ballLog should be BallDetail[]
    currentPartnership: 0, // you can compute from last wicket if needed
  };
};

export const selectMatchResult = (state: ScoringStore): string | undefined => {
  // If second innings hasn't started or incomplete
  if (!state.innings2.battingTeam) return undefined;
  const runs1 = state.innings1.totalRuns;
  const runs2 = state.innings2.totalRuns;
  const wickets2 = state.innings2.wickets;
  const maxWickets = parseInt(state.matchRules.playersPerTeam, 10) - 1;

  // If second innings completed (overs or all out) or target reached
  const innings2Complete =
    state.innings2.overs >= state.maxOvers || wickets2 >= maxWickets;

  if (runs2 > runs1) {
    const wicketsLost = wickets2;
    const wicketsRemaining = maxWickets - wicketsLost;
    return `${state.teamB.name} won by ${wicketsRemaining} wickets`;
  } else if (runs1 > runs2 && innings2Complete) {
    const margin = runs1 - runs2;
    return `${state.teamA.name} won by ${margin} runs`;
  } else if (runs1 === runs2 && innings2Complete) {
    return "Match Tied";
  }
  return undefined;
};
