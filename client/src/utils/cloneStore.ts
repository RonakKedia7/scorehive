import { ScoringStore } from "@/types";

export const cloneScoringStore = (state: ScoringStore): ScoringStore => {
  // Clone players
  const players = Object.fromEntries(
    Object.entries(state.players).map(([id, player]) => [
      id,
      {
        ...player,
        stats: JSON.parse(JSON.stringify(player.stats)),
      },
    ]),
  );

  // Clone teams
  const teamA = { ...state.teamA, playersIds: [...state.teamA.playersIds] };
  const teamB = { ...state.teamB, playersIds: [...state.teamB.playersIds] };

  // Clone innings
  const cloneInnings = (innings: any) => ({
    ...innings,
    extras: { ...innings.extras },
    thisOver: [...innings.thisOver],
  });

  return {
    ...state,
    players,
    teamA,
    teamB,
    innings1: cloneInnings(state.innings1),
    innings2: cloneInnings(state.innings2),

    undoStack: [],
  };
};
