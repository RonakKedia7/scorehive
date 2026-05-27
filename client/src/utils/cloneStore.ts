import { ScoringStore, Innings } from "@/types";
import { BallDetail } from "@/types/scorecard";

function cloneInnings(innings: Innings): Innings {
  return {
    ...innings,
    extras: { ...innings.extras },
    thisOver: [...innings.thisOver],
    ballLog: [...innings.ballLog],
    fallOfWickets: [...innings.fallOfWickets],
  };
}

export function cloneScoringStore(state: ScoringStore): ScoringStore {
  // Deep clone players
  const players = Object.fromEntries(
    Object.entries(state.players).map(([id, player]) => [
      id,
      {
        ...player,
        stats: {
          playerId: player.stats.playerId,
          batting: { ...player.stats.batting },
          bowling: { ...player.stats.bowling },
        },
      },
    ]),
  );

  return {
    ...state,
    players,
    teamA: { ...state.teamA, playersIds: [...state.teamA.playersIds] },
    teamB: { ...state.teamB, playersIds: [...state.teamB.playersIds] },
    innings1: cloneInnings(state.innings1),
    innings2: cloneInnings(state.innings2),
    undoStack: [],
  };
}
