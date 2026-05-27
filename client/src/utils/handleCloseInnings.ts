import { useScoringStore } from "@/stores/useScoringStore";

const handleCloseInnings = () => {
  const scoringState = useScoringStore.getState();

  const currentInningsData =
    scoringState.currentInnings === 1
      ? scoringState.innings1
      : scoringState.innings2;

  const battingTeamKey = currentInningsData.battingTeam;
  const battingTeam =
    battingTeamKey === "teamA" ? scoringState.teamA : scoringState.teamB;

  // Gather batsmen data
  const batsmen = Object.values(scoringState.players)
    .filter((p) => battingTeam.playersIds.includes(p.id))
    .map((p) => ({
      playerId: p.id,
      name: p.name,
      runs: p.stats.batting.runs,
      balls: p.stats.batting.balls,
      fours: p.stats.batting.fours,
      sixes: p.stats.batting.sixes,
      strikeRate: p.stats.batting.strikeRate,
      dismissal: p.stats.batting.isOut
        ? p.stats.batting.dismissalType
        : undefined,
    }));

  // Gather bowlers data
  const bowlers = Object.values(scoringState.players)
    .filter((p) => {
      const bowlingTeamKey = currentInningsData.bowlingTeam;
      const bowlingTeam =
        bowlingTeamKey === "teamA" ? scoringState.teamA : scoringState.teamB;
      return bowlingTeam.playersIds.includes(p.id);
    })
    .map((p) => ({
      playerId: p.id,
      name: p.name,
      overs: p.stats.bowling.overs,
      balls: p.stats.bowling.balls,
      maidens: p.stats.bowling.maidens,
      runs: p.stats.bowling.runs,
      wickets: p.stats.bowling.wickets,
      economy: p.stats.bowling.economy,
    }));

  // All team players for DNB
  const allTeamPlayers = battingTeam.playersIds.map((id) => ({
    id,
    name: scoringState.players[id]?.name ?? "Unknown",
  }));
};
