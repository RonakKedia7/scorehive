import { Innings, Player, ScoringStore } from "@/types";
import { create } from "zustand";
import uuid from "react-native-uuid";

const createEmptyInnings = (): Innings => ({
  battingTeam: null,
  bowlingTeam: null,

  totalRuns: 0,
  wickets: 0,

  overs: 0,
  balls: 0,

  strikerId: null,
  nonStrikerId: null,

  currentBowlerId: null,

  playersStats: [],

  extras: {
    wides: 0,
    noBalls: 0,

    byes: 0,
    legByes: 0,
  },

  thisOver: [],
});

const initialState = {
  teamA: {
    name: "",
    players: [],
  },

  teamB: {
    name: "",
    players: [],
  },

  currentInnings: 1 as 1 | 2,

  innings1: createEmptyInnings(),

  innings2: createEmptyInnings(),
};

export const useScoringStore = create<ScoringStore>((set) => ({
  ...initialState,

  initializeMatch: ({
    teamAName,
    teamBName,
    battingTeam,
    strikerName,
    nonStrikerName,
    bowlerName,
  }) =>
    set((state) => {
      const bowlingTeam = battingTeam === "teamA" ? "teamB" : "teamA";

      const striker: Player = {
        id: uuid.v4().toString(),
        name: strikerName,
      };
      const nonStriker: Player = {
        id: uuid.v4().toString(),
        name: nonStrikerName,
      };

      const bowler: Player = {
        id: uuid.v4().toString(),
        name: bowlerName,
      };

      return {
        currentInnings: 1,

        teamA: {
          ...state.teamA,
          name: teamAName,
          players:
            battingTeam === "teamA"
              ? [...state.teamA.players, striker, nonStriker]
              : [...state.teamA.players, bowler],
        },

        teamB: {
          ...state.teamB,
          name: teamBName,
          players:
            battingTeam === "teamB"
              ? [...state.teamB.players, striker, nonStriker]
              : [...state.teamB.players, bowler],
        },

        innings1: {
          ...state.innings1,

          battingTeam,
          bowlingTeam,

          strikerId: striker.id,
          nonStrikerId: nonStriker.id,

          currentBowlerId: bowler.id,
        },
      };
    }),

  resetScoringStore: () =>
    set({
      ...initialState,
    }),
}));
