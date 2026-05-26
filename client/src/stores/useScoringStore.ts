import { create } from "zustand";
import { MatchRules, ScoringStore } from "@/types";
import { initializeMatch as initMatch } from "@/utils/initializeMatch";
import { addBall as addBallLogic } from "@/utils/addBall";
import { createEmptyInnings, createPlayer } from "@/utils/helperFunctions";
import { useScorecardStore } from "./useScorecardStore";

const defaultMatchRules: MatchRules = {
  playersPerTeam: "11",
  noBall: { enabled: true, reBall: true, runs: "1" },
  wide: { enabled: true, reBall: true, runs: "1" },
};

const initialState = {
  players: {},

  matchRules: defaultMatchRules,

  teamA: { name: "", playersIds: [] },
  teamB: { name: "", playersIds: [] },

  currentInnings: 1 as 1 | 2,

  innings1: createEmptyInnings(),
  innings2: createEmptyInnings(),

  overCompleted: false,
};

export const useScoringStore = create<ScoringStore>((set, get) => ({
  ...initialState,

  initializeMatch: (params) => set((state) => initMatch({ ...params, state })),

  addBall: (ballResult, options) =>
    set((state) => {
      const {
        state: newState,
        ballDetail,
        overComplete,
      } = addBallLogic(state, ballResult, options);

      // Update scorecard store (safe, no cycle)
      useScorecardStore.getState().recordBall(ballDetail);

      return {
        ...newState,
        overCompleted: overComplete,
      };
    }),

  startNewOverWithBowler: (bowlerName: string) =>
    set((state) => {
      const newBowler = createPlayer(bowlerName);
      const players = { ...state.players, [newBowler.id]: newBowler };

      const inningsKey = state.currentInnings === 1 ? "innings1" : "innings2";
      const innings = state[inningsKey];
      const bowlingTeamKey = innings.bowlingTeam!; // "teamA" or "teamB"

      // Add new bowler to the bowling team's playersIds
      const team = { ...state[bowlingTeamKey] };
      if (!team.playersIds.includes(newBowler.id)) {
        team.playersIds = [...team.playersIds, newBowler.id];
      }

      return {
        players,
        [bowlingTeamKey]: team,
        [inningsKey]: {
          ...innings,
          currentBowlerId: newBowler.id,
        },
      };
    }),

  clearOverCompleted: () => set({ overCompleted: false }),

  resetScoringStore: () => set({ ...initialState }),
}));
