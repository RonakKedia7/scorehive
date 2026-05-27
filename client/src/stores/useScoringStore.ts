import { create } from "zustand";
import { Innings, MatchRules, ScoringStore } from "@/types";
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
        const inningsKey = state.currentInnings === 1 ? "innings1" : "innings2";
        const currentBallLog = state[inningsKey]?.ballLog || [];

        const {
          state: newState,
          ballDetail,
          overComplete,
        } = addBallLogic(state, ballResult, options as any);

        const updatedInnings = newState[inningsKey];
        if (!updatedInnings) {
          return {
            ...newState,
            overCompleted: overComplete,
            lastBall: ballDetail,
          };
        }

        const finalInnings = {
          ...updatedInnings,
          ballLog: [...currentBallLog, ballDetail],
        };

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
      const { undoStack } = get();
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

    retireBatsman: (type, newBatsmanId, newBatsmanName) => {
      pushToUndo();
      set((state) => {
        const inningsKey = state.currentInnings === 1 ? "innings1" : "innings2";
        const innings = state[inningsKey];
        if (!innings.strikerId) return state;

        const striker = state.players[innings.strikerId];
        if (!striker) return state;

        // Mark batsman as retired
        striker.stats.batting.isOut = true;
        striker.stats.batting.dismissalType = `retired ${type}`;
        striker.stats.batting.dismissal = `retired ${type}`;

        const maxWickets = parseInt(state.matchRules.playersPerTeam, 10) - 1;
        const newWickets = innings.wickets + 1;
        const inningsEnded = newWickets >= maxWickets;

        let newStrikerId: string | null = innings.strikerId;
        let newNonStrikerId: string | null = innings.nonStrikerId;

        if (!inningsEnded) {
          if (!newBatsmanId) {
            throw new Error("New batsman ID required for retired batsman");
          }
          // Add new batsman to players if not exists
          const playersCopy = { ...state.players };
          if (!playersCopy[newBatsmanId] && newBatsmanName) {
            playersCopy[newBatsmanId] = createPlayer(newBatsmanName);
          }
          newStrikerId = newBatsmanId;
          // Non‑striker remains unchanged
        } else {
          newStrikerId = null;
          newNonStrikerId = null;
        }

        const ballDetail: BallDetail = {
          ballIndex: -1,
          overNumber: innings.overs,
          ballInOver: innings.ballsInOver,
          result: `R${type === "hurt" ? "H" : "O"}`,
          runs: 0,
          batterRuns: 0,
          extraRuns: 0,
          extraType: null,
          isWicket: true,
          isLegal: false,
          wicketType: `retired ${type}`,
          batsmanOutId: innings.strikerId,
          facingStrikerId: innings.strikerId,
          facingNonStrikerId: innings.nonStrikerId!,
          bowlerId: "",
          bowlerRuns: 0,
          isBowlerWicket: false,
          overComplete: false,
          facingStrikerName: striker.name,
          facingNonStrikerName:
            state.players[innings.nonStrikerId!]?.name || "",
          bowlerName: "",
          dismissalString: `retired ${type}`,
        };

        const updatedInnings = {
          ...innings,
          wickets: newWickets,
          strikerId: newStrikerId,
          nonStrikerId: newNonStrikerId,
          ballLog: [...innings.ballLog, ballDetail],
        };

        const updatedPlayers = { ...state.players, [striker.id]: striker };
        if (newBatsmanId && !state.players[newBatsmanId] && newBatsmanName) {
          updatedPlayers[newBatsmanId] = createPlayer(newBatsmanName);
        }

        return {
          players: updatedPlayers,
          [inningsKey]: updatedInnings,
          lastBall: ballDetail,
        };
      });
    },

    startNewInnings: () => {
      pushToUndo();
      set((state) => {
        const nextBattingTeam = state.currentInnings === 1 ? "teamB" : "teamA";
        const battingTeamKey = nextBattingTeam;
        const bowlingTeamKey = battingTeamKey === "teamA" ? "teamB" : "teamA";

        const battingOrder = state[battingTeamKey].playersIds;
        if (battingOrder.length < 2)
          throw new Error("Not enough players for batting order");

        const strikerId = battingOrder[0];
        const nonStrikerId = battingOrder[1];
        const currentBowlerId = state[bowlingTeamKey].playersIds[0] || null;

        const newInnings: Innings = {
          battingTeam: battingTeamKey,
          bowlingTeam: bowlingTeamKey,
          totalRuns: 0,
          wickets: 0,
          overs: 0,
          ballsInOver: 0,
          strikerId,
          nonStrikerId,
          currentBowlerId,
          extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
          thisOver: [],
          ballLog: [],
          fallOfWickets: [],
        };

        const nextInningsNumber = state.currentInnings === 1 ? 2 : 1;

        return {
          currentInnings: nextInningsNumber,
          [nextInningsNumber === 1 ? "innings1" : "innings2"]: newInnings,
          overCompleted: false,
          lastBall: null,
        };
      });
    },

    clearHistory: () => set({ undoStack: [] }),
  };
});
