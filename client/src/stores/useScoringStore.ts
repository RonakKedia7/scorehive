import { create } from "zustand";
import { MatchRules, Player, ScoringStore } from "@/types";
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
  maxOvers: 0,
};

// Simple ID generator (or import from utils)
const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substring(2, 8);

export const useScoringStore = create<ScoringStore>((set, get) => ({
  ...initialState,

  initializeMatch: (params) =>
    set((state) => {
      const matchState = initMatch({ ...params, state });
      return {
        ...matchState,
        maxOvers: params.maxOvers,
      };
    }),

  addBall: (ballResult, options) =>
    set((state) => {
      const {
        state: newState,
        ballDetail,
        overComplete,
      } = addBallLogic(state, ballResult, options);

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
      const bowlingTeamKey = innings.bowlingTeam!;

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

  setBowler: (playerId: string) =>
    set((state) => {
      const inningsKey = state.currentInnings === 1 ? "innings1" : "innings2";
      return {
        [inningsKey]: {
          ...state[inningsKey],
          currentBowlerId: playerId,
          thisOver: [],
        },
        overCompleted: false,
      };
    }),

  addPlayerToBattingTeam: (name: string) => {
    const newPlayer = createPlayer(name);
    set((state) => {
      const players = { ...state.players, [newPlayer.id]: newPlayer };
      const inningsKey = state.currentInnings === 1 ? "innings1" : "innings2";
      const innings = state[inningsKey];
      const battingTeamKey = innings.battingTeam!;
      const team = { ...state[battingTeamKey] };

      if (!team.playersIds.includes(newPlayer.id)) {
        team.playersIds = [...team.playersIds, newPlayer.id];
      }

      return {
        players,
        [battingTeamKey]: team,
      };
    });
    return newPlayer.id;
  },

  addPlayerToTeam: (teamKey: "teamA" | "teamB", name: string) => {
    // Reuse createPlayer to ensure consistent stats
    const newPlayer = createPlayer(name);
    set((state) => {
      const players = { ...state.players, [newPlayer.id]: newPlayer };
      const team = { ...state[teamKey] };

      if (!team.playersIds.includes(newPlayer.id)) {
        team.playersIds = [...team.playersIds, newPlayer.id];
      }

      return {
        players,
        [teamKey]: team,
      };
    });
    return newPlayer.id;
  },

  resetScoringStore: () => set({ ...initialState }),
}));
