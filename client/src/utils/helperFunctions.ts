import { Innings, Player } from "@/types";
import uuid from "react-native-uuid";

export const createEmptyInnings = (): Innings => ({
  battingTeam: null,
  bowlingTeam: null,

  totalRuns: 0,
  wickets: 0,

  overs: 0,
  ballsInOver: 0,

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
  ballLog: [],
  fallOfWickets: [],
});

export const createPlayer = (name: string): Player => {
  const id = uuid.v4().toString();

  return {
    id,
    name,
    stats: {
      playerId: id,
      batting: {
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false,
        dismissalType: undefined,
      },
      bowling: {
        overs: 0,
        balls: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        economy: 0,
      },
    },
  };
};
