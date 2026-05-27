import { create } from "zustand";
import { MatchRules, ScoringStore } from "@/types";
import { initializeMatch as initMatch } from "@/utils/initializeMatch";
import { addBall as addBallLogic } from "@/utils/addBall";
import { createEmptyInnings, createPlayer } from "@/utils/helperFunctions";
import { cloneScoringStore } from "@/utils/cloneStore";
import { BallDetail } from "@/types/scorecard";

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
  lastBall: null as BallDetail | null,
};

export const useScoringStore = create<ScoringStore>((set, get) => {
  const pushToUndo = () => {
    const current = get();
    const snapshot = cloneScoringStore(current);
    set((state) => ({
      undoStack: [snapshot, ...state.undoStack].slice(0, 20),
      // redoStack removed entirely
    }));
  };

  return {
    ...initialState,

    undoStack: [],

    lastBall: null,

    initializeMatch: (params) => {
      pushToUndo();
      set((state) => {
        const matchState = initMatch({ ...params, state });
        return {
          ...matchState,
          maxOvers: params.maxOvers,
          lastBall: null,
        };
      });
    },

    addBall: (ballResult, options) => {
      pushToUndo();
      set((state) => {
        // 1. Capture current ballLog BEFORE any changes
        const inningsKey = state.currentInnings === 1 ? "innings1" : "innings2";
        const currentBallLog = state[inningsKey]?.ballLog || [];

        // 2. Call the pure scoring engine
        const {
          state: newState,
          ballDetail,
          overComplete,
        } = addBallLogic(state, ballResult, options as any);

        // 3. Get the updated innings from newState (this has updated runs, wickets, etc., but no ballLog)
        const updatedInnings = newState[inningsKey];
        if (!updatedInnings) {
          return {
            ...newState,
            overCompleted: overComplete,
            lastBall: ballDetail,
          };
        }

        // 4. Create the final innings with the merged ballLog
        const finalInnings = {
          ...updatedInnings,
          ballLog: [...currentBallLog, ballDetail],
        };

        // 5. Return merged state
        return {
          ...newState,
          [inningsKey]: finalInnings,
          overCompleted: overComplete,
          lastBall: ballDetail,
        };
      });
    },

    startNewOverWithBowler: (bowlerName: string) => {
      pushToUndo();
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
      });
    },

    clearOverCompleted: () => {
      pushToUndo();
      set({ overCompleted: false });
    },

    setBowler: (playerId: string) => {
      pushToUndo();
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
      });
    },

    addPlayerToBattingTeam: (name: string) => {
      pushToUndo();
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
        return { players, [battingTeamKey]: team };
      });
      return newPlayer.id;
    },

    addPlayerToTeam: (teamKey: "teamA" | "teamB", name: string) => {
      pushToUndo();
      const newPlayer = createPlayer(name);
      set((state) => {
        const players = { ...state.players, [newPlayer.id]: newPlayer };
        const team = { ...state[teamKey] };
        if (!team.playersIds.includes(newPlayer.id)) {
          team.playersIds = [...team.playersIds, newPlayer.id];
        }
        return { players, [teamKey]: team };
      });
      return newPlayer.id;
    },

    resetScoringStore: () => {
      pushToUndo();
      set({ ...initialState, undoStack: [], lastBall: null });
    },

    undo: () => {
      const { undoStack, lastBall } = get();
      if (undoStack.length === 0) return;
      const [previousState, ...remainingUndo] = undoStack;

      set({
        ...previousState,
        undoStack: remainingUndo,
        lastBall: previousState.lastBall,
      });
    },

    swapBatsmen: () => {
      pushToUndo();
      set((state) => {
        const inningsKey = state.currentInnings === 1 ? "innings1" : "innings2";
        const innings = state[inningsKey];
        if (!innings.strikerId || !innings.nonStrikerId) return state;
        return {
          [inningsKey]: {
            ...innings,
            strikerId: innings.nonStrikerId,
            nonStrikerId: innings.strikerId,
          },
          lastBall: null,
        };
      });
    },

    clearHistory: () => set({ undoStack: [] }),
  };
});
