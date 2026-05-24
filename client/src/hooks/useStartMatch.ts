import { useRouter } from "expo-router";

import { useInitialMatchSetup } from "@/stores/useInitialMatchSetup";

import { useMatchStore } from "@/stores/useMatchStore";

import { useScoringStore } from "@/stores/useScoringStore";

type StartMatchParams = {
  strikerName: string;

  nonStrikerName: string;

  openingBowlerName: string;
};

export const useStartMatch = () => {
  const router = useRouter();

  const {
    teamA,
    teamB,

    tossWonBy,
    optedTo,
  } = useInitialMatchSetup();

  const {
    setTeamAName,
    setTeamBName,

    addPlayerToTeamA,
    addPlayerToTeamB,
  } = useMatchStore();

  const { innings1 } = useScoringStore();

  const startMatch = ({
    strikerName,

    nonStrikerName,

    openingBowlerName,
  }: StartMatchParams) => {
    // BATTING TEAM
    const battingTeam =
      tossWonBy === "teamA"
        ? optedTo === "bat"
          ? "teamA"
          : "teamB"
        : optedTo === "bat"
          ? "teamB"
          : "teamA";

    // BOWLING TEAM
    const bowlingTeam = battingTeam === "teamA" ? "teamB" : "teamA";

    // SAVE TEAM NAMES
    setTeamAName(teamA);

    setTeamBName(teamB);

    let strikerPlayer;

    let nonStrikerPlayer;

    let bowlerPlayer;

    // ADD PLAYERS TO CORRECT TEAMS
    if (battingTeam === "teamA") {
      strikerPlayer = addPlayerToTeamA(strikerName);

      nonStrikerPlayer = addPlayerToTeamA(nonStrikerName);

      bowlerPlayer = addPlayerToTeamB(openingBowlerName);
    } else {
      strikerPlayer = addPlayerToTeamB(strikerName);

      nonStrikerPlayer = addPlayerToTeamB(nonStrikerName);

      bowlerPlayer = addPlayerToTeamA(openingBowlerName);
    }

    // START FIRST INNINGS
    useScoringStore.setState({
      currentInnings: 1,

      innings1: {
        ...innings1,

        battingTeam,

        bowlingTeam,

        strikerId: strikerPlayer.id,

        nonStrikerId: nonStrikerPlayer.id,

        currentBowlerId: bowlerPlayer.id,
      },
    });

    // REDIRECT
    // router.push("/scoring");
  };

  return {
    startMatch,
  };
};
