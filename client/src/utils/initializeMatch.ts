import { MatchRules, TeamKey } from "@/types";
import { createEmptyInnings, createPlayer } from "@/utils/helperFunctions";

type Params = {
  teamAName: string;
  teamBName: string;
  battingTeam: TeamKey;
  strikerName: string;
  nonStrikerName: string;
  bowlerName: string;
  matchRules: MatchRules;
  state: any;
};

export const initializeMatch = ({
  teamAName,
  teamBName,
  battingTeam,
  strikerName,
  nonStrikerName,
  bowlerName,
  matchRules,
  state,
}: Params) => {
  const bowlingTeam: TeamKey = battingTeam === "teamA" ? "teamB" : "teamA";

  const striker = createPlayer(strikerName);
  const nonStriker = createPlayer(nonStrikerName);
  const bowler = createPlayer(bowlerName);

  const playersMap = {
    ...state.players,
    [striker.id]: striker,
    [nonStriker.id]: nonStriker,
    [bowler.id]: bowler,
  };

  const teamAPlayers: string[] =
    battingTeam === "teamA" ? [striker.id, nonStriker.id] : [bowler.id];

  const teamBPlayers: string[] =
    battingTeam === "teamB" ? [striker.id, nonStriker.id] : [bowler.id];

  return {
    players: playersMap,

    teamA: {
      name: teamAName,
      playersIds: teamAPlayers,
    },

    teamB: {
      name: teamBName,
      playersIds: teamBPlayers,
    },

    currentInnings: 1 as 1 | 2,

    innings1: {
      ...createEmptyInnings(),
      battingTeam,
      bowlingTeam,
      strikerId: striker.id,
      nonStrikerId: nonStriker.id,
      currentBowlerId: bowler.id,
    },

    innings2: createEmptyInnings(),

    matchRules,
  };
};
