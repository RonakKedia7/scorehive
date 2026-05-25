import { create } from "zustand";
import { ScoringStore } from "@/types";
import { initializeMatch as initMatch } from "@/utils/initializeMatch";

import { createEmptyInnings } from "@/utils/helperFunctions";

const initialState = {
  players: {},

  teamA: { name: "", playersIds: [] },
  teamB: { name: "", playersIds: [] },

  currentInnings: 1 as 1 | 2,

  innings1: createEmptyInnings(),
  innings2: createEmptyInnings(),
};

export const useScoringStore = create<ScoringStore>((set, get) => ({
  ...initialState,

  initializeMatch: (params) => set((state) => initMatch({ ...params, state })),

  resetScoringStore: () => set({ ...initialState }),
}));
