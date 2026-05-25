import { InitialMatchSetupState, OptedTo } from "@/types";
import { create } from "zustand";

const initialState = {
  teamA: "",
  teamB: "",

  tossWonBy: "teamA",
  optedTo: "bat" as "" | OptedTo,

  overs: "",

  matchRules: {
    playersPerTeam: "11",

    noBall: {
      enabled: true,
      reBall: true,
      runs: "1",
    },

    wide: {
      enabled: true,
      reBall: true,
      runs: "1",
    },
  },
};

export const useInitialMatchSetup = create<InitialMatchSetupState>((set) => ({
  ...initialState,

  setTeamA: (teamA) => set({ teamA }),

  setTeamB: (teamB) => set({ teamB }),

  setTossWonBy: (tossWonBy) => set({ tossWonBy }),

  setOptedTo: (optedTo) => set({ optedTo }),

  setOvers: (overs) => set({ overs }),

  setPlayersPerTeam: (playersPerTeam) =>
    set((state) => ({
      matchRules: {
        ...state.matchRules,
        playersPerTeam,
      },
    })),

  toggleNoBall: (enabled) =>
    set((state) => ({
      matchRules: {
        ...state.matchRules,
        noBall: {
          ...state.matchRules.noBall,
          enabled,
        },
      },
    })),

  setNoBallReBall: (reBall) =>
    set((state) => ({
      matchRules: {
        ...state.matchRules,
        noBall: {
          ...state.matchRules.noBall,
          reBall,
        },
      },
    })),

  setNoBallRuns: (runs) =>
    set((state) => ({
      matchRules: {
        ...state.matchRules,
        noBall: {
          ...state.matchRules.noBall,
          runs,
        },
      },
    })),

  toggleWide: (enabled) =>
    set((state) => ({
      matchRules: {
        ...state.matchRules,
        wide: {
          ...state.matchRules.wide,
          enabled,
        },
      },
    })),

  setWideReBall: (reBall) =>
    set((state) => ({
      matchRules: {
        ...state.matchRules,
        wide: {
          ...state.matchRules.wide,
          reBall,
        },
      },
    })),

  setWideRuns: (runs) =>
    set((state) => ({
      matchRules: {
        ...state.matchRules,
        wide: {
          ...state.matchRules.wide,
          runs,
        },
      },
    })),

  resetMatchSetup: () => set(initialState),
}));
