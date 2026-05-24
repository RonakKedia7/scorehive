// stores/useInitialMatchSetup.ts

import { create } from "zustand";

type OptedTo = "bat" | "bowl";

type MatchRules = {
  playersPerTeam: string;

  noBall: {
    enabled: boolean;
    reBall: boolean;
    runs: string;
  };

  wide: {
    enabled: boolean;
    reBall: boolean;
    runs: string;
  };
};

type InitialMatchSetupState = {
  teamA: string;
  teamB: string;

  tossWonBy: string;
  optedTo: "" | OptedTo;

  overs: string;

  matchRules: MatchRules;

  setTeamA: (team: string) => void;
  setTeamB: (team: string) => void;

  setTossWonBy: (team: string) => void;
  setOptedTo: (option: OptedTo) => void;

  setOvers: (overs: string) => void;

  setPlayersPerTeam: (players: string) => void;

  toggleNoBall: (enabled: boolean) => void;
  setNoBallReBall: (reBall: boolean) => void;
  setNoBallRuns: (runs: string) => void;

  toggleWide: (enabled: boolean) => void;
  setWideReBall: (reBall: boolean) => void;
  setWideRuns: (runs: string) => void;

  resetMatchSetup: () => void;
};

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
