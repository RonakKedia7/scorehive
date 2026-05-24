import { create } from "zustand";

export type BattingStats = {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;

  strikeRate: number;

  isOut: boolean;

  dismissalType: string | null;
};

export type BowlingStats = {
  overs: number;
  balls: number;

  maidens: number;

  runs: number;

  wickets: number;

  economy: number;
};

export type Extras = {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
};

export type Innings = {
  battingTeam: "teamA" | "teamB";
  bowlingTeam: "teamA" | "teamB";

  totalRuns: number;
  wickets: number;

  overs: number;
  balls: number;

  strikerId: string | null;
  nonStrikerId: string | null;

  currentBowlerId: string | null;

  extras: Extras;

  thisOver: string[];

  battingStats: Record<string, BattingStats>;

  bowlingStats: Record<string, BowlingStats>;
};

type ScoringStore = {
  currentInnings: 1 | 2;

  innings1: Innings;

  innings2: Innings;

  setCurrentInnings: (innings: 1 | 2) => void;

  setStriker: (innings: 1 | 2, playerId: string) => void;

  setNonStriker: (innings: 1 | 2, playerId: string) => void;

  setCurrentBowler: (innings: 1 | 2, playerId: string) => void;

  addRuns: (innings: 1 | 2, playerId: string, runs: number) => void;

  addWicket: (innings: 1 | 2, playerId: string, dismissalType: string) => void;

  addWide: (innings: 1 | 2, runs?: number) => void;

  addNoBall: (innings: 1 | 2, runs?: number) => void;

  nextBall: (innings: 1 | 2) => void;

  setInnings: (inningsNumber: 1 | 2, inningsData: Innings) => void;

  resetScoringStore: () => void;
};

const createEmptyInnings = (
  battingTeam: "teamA" | "teamB",
  bowlingTeam: "teamA" | "teamB",
): Innings => ({
  battingTeam,
  bowlingTeam,

  totalRuns: 0,
  wickets: 0,

  overs: 0,
  balls: 0,

  strikerId: null,
  nonStrikerId: null,

  currentBowlerId: null,

  extras: {
    wides: 0,
    noBalls: 0,
    byes: 0,
    legByes: 0,
  },

  thisOver: [],

  battingStats: {},

  bowlingStats: {},
});

const initialState = {
  currentInnings: 1 as 1 | 2,

  innings1: createEmptyInnings("teamA", "teamB"),

  innings2: createEmptyInnings("teamB", "teamA"),
};

export const useScoringStore = create<ScoringStore>((set) => ({
  ...initialState,

  setCurrentInnings: (currentInnings) =>
    set({
      currentInnings,
    }),

  // STRIKER
  setStriker: (innings, playerId) =>
    set((state) => ({
      [`innings${innings}`]: {
        ...state[`innings${innings}`],
        strikerId: playerId,
      },
    })),

  // NON STRIKER
  setNonStriker: (innings, playerId) =>
    set((state) => ({
      [`innings${innings}`]: {
        ...state[`innings${innings}`],
        nonStrikerId: playerId,
      },
    })),

  // CURRENT BOWLER
  setCurrentBowler: (innings, playerId) =>
    set((state) => ({
      [`innings${innings}`]: {
        ...state[`innings${innings}`],
        currentBowlerId: playerId,
      },
    })),

  // ADD RUNS
  addRuns: (innings, playerId, runs) =>
    set((state) => {
      const inningsKey = `innings${innings}` as "innings1" | "innings2";

      const currentInnings = state[inningsKey];

      const currentPlayerStats = currentInnings.battingStats[playerId] || {
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false,
        dismissalType: null,
      };

      const updatedRuns = currentPlayerStats.runs + runs;

      const updatedBalls = currentPlayerStats.balls + 1;

      return {
        [inningsKey]: {
          ...currentInnings,

          totalRuns: currentInnings.totalRuns + runs,

          battingStats: {
            ...currentInnings.battingStats,

            [playerId]: {
              ...currentPlayerStats,

              runs: updatedRuns,

              balls: updatedBalls,

              fours:
                runs === 4
                  ? currentPlayerStats.fours + 1
                  : currentPlayerStats.fours,

              sixes:
                runs === 6
                  ? currentPlayerStats.sixes + 1
                  : currentPlayerStats.sixes,

              strikeRate:
                updatedBalls > 0
                  ? Number(((updatedRuns / updatedBalls) * 100).toFixed(2))
                  : 0,
            },
          },

          thisOver: [...currentInnings.thisOver, runs.toString()],
        },
      };
    }),

  // WICKET
  addWicket: (innings, playerId, dismissalType) =>
    set((state) => {
      const inningsKey = `innings${innings}` as "innings1" | "innings2";

      const currentInnings = state[inningsKey];

      const currentPlayerStats = currentInnings.battingStats[playerId];

      if (!currentPlayerStats) {
        return state;
      }

      return {
        [inningsKey]: {
          ...currentInnings,

          wickets: currentInnings.wickets + 1,

          battingStats: {
            ...currentInnings.battingStats,

            [playerId]: {
              ...currentPlayerStats,

              isOut: true,

              dismissalType,
            },
          },

          thisOver: [...currentInnings.thisOver, "W"],
        },
      };
    }),

  // WIDE
  addWide: (innings, runs = 1) =>
    set((state) => {
      const inningsKey = `innings${innings}` as "innings1" | "innings2";

      const currentInnings = state[inningsKey];

      return {
        [inningsKey]: {
          ...currentInnings,

          totalRuns: currentInnings.totalRuns + runs,

          extras: {
            ...currentInnings.extras,

            wides: currentInnings.extras.wides + runs,
          },

          thisOver: [...currentInnings.thisOver, `${runs}Wd`],
        },
      };
    }),

  // NO BALL
  addNoBall: (innings, runs = 1) =>
    set((state) => {
      const inningsKey = `innings${innings}` as "innings1" | "innings2";

      const currentInnings = state[inningsKey];

      return {
        [inningsKey]: {
          ...currentInnings,

          totalRuns: currentInnings.totalRuns + runs,

          extras: {
            ...currentInnings.extras,

            noBalls: currentInnings.extras.noBalls + runs,
          },

          thisOver: [...currentInnings.thisOver, `${runs}Nb`],
        },
      };
    }),

  // NEXT BALL
  nextBall: (innings) =>
    set((state) => {
      const inningsKey = `innings${innings}` as "innings1" | "innings2";

      const currentInnings = state[inningsKey];

      let updatedBalls = currentInnings.balls + 1;

      let updatedOvers = currentInnings.overs;

      if (updatedBalls === 6) {
        updatedOvers += 1;
        updatedBalls = 0;
      }

      return {
        [inningsKey]: {
          ...currentInnings,

          overs: updatedOvers,

          balls: updatedBalls,
        },
      };
    }),

  setInnings: (inningsNumber, inningsData) =>
    set({ [`innings${inningsNumber}`]: inningsData }),

  // RESET
  resetScoringStore: () => set(initialState),
}));
