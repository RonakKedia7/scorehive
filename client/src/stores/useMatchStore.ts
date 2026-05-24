import { create } from "zustand";
import uuid from "react-native-uuid";

export type PlayerRole = "batter" | "bowler" | "all-rounder";

export type Player = {
  id: string;
  name: string;

  role?: PlayerRole;
};

export type Team = {
  name: string;

  players: Player[];
};

type MatchStore = {
  teamA: Team;

  teamB: Team;

  setTeamAName: (name: string) => void;

  setTeamBName: (name: string) => void;

  addPlayerToTeamA: (playerName: string) => Player;

  addPlayerToTeamB: (playerName: string) => Player;

  removePlayerFromTeamA: (playerId: string) => void;

  removePlayerFromTeamB: (playerId: string) => void;

  resetMatchStore: () => void;
};

const initialState = {
  teamA: {
    name: "",

    players: [],
  },

  teamB: {
    name: "",

    players: [],
  },
};

export const useMatchStore = create<MatchStore>((set, get) => ({
  ...initialState,

  // TEAM NAMES
  setTeamAName: (name) =>
    set((state) => ({
      teamA: {
        ...state.teamA,

        name,
      },
    })),

  setTeamBName: (name) =>
    set((state) => ({
      teamB: {
        ...state.teamB,

        name,
      },
    })),

  // ADD PLAYER TEAM A
  addPlayerToTeamA: (playerName) => {
    const player = {
      id: uuid.v4().toString(),
      name: playerName,
    };

    set((state) => ({
      teamA: {
        ...state.teamA,

        players: [...state.teamA.players, player],
      },
    }));

    return player;
  },

  // ADD PLAYER TEAM B
  addPlayerToTeamB: (playerName) => {
    const player = {
      id: uuid.v4().toString(),
      name: playerName,
    };

    set((state) => ({
      teamB: {
        ...state.teamB,

        players: [...state.teamB.players, player],
      },
    }));

    return player;
  },

  // REMOVE TEAM A PLAYER
  removePlayerFromTeamA: (playerId) =>
    set((state) => ({
      teamA: {
        ...state.teamA,

        players: state.teamA.players.filter((player) => player.id !== playerId),
      },
    })),

  // REMOVE TEAM B PLAYER
  removePlayerFromTeamB: (playerId) =>
    set((state) => ({
      teamB: {
        ...state.teamB,

        players: state.teamB.players.filter((player) => player.id !== playerId),
      },
    })),

  // RESET
  resetMatchStore: () => set(initialState),
}));
