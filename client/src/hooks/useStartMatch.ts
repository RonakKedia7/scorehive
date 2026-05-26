import { useRouter } from "expo-router";
import { useInitialMatchSetup } from "@/stores/useInitialMatchSetup";
import { useScoringStore } from "@/stores/useScoringStore";
import { useScorecardStore } from "@/stores/useScorecardStore";

type StartMatchParams = {
  strikerName: string;
  nonStrikerName: string;
  openingBowlerName: string;
};

export const useStartMatch = () => {
  const router = useRouter();
  const {
    teamA: teamAName,
    teamB: teamBName,
    tossWonBy,
    optedTo,
    matchRules,
    overs,
  } = useInitialMatchSetup();
  const { initializeMatch } = useScoringStore();

  const startMatch = ({
    strikerName,
    nonStrikerName,
    openingBowlerName,
  }: StartMatchParams) => {
    const battingTeam =
      tossWonBy === "teamA"
        ? optedTo === "bat"
          ? "teamA"
          : "teamB"
        : optedTo === "bat"
          ? "teamB"
          : "teamA";

    initializeMatch({
      teamAName,
      teamBName,
      battingTeam,
      strikerName,
      nonStrikerName,
      bowlerName: openingBowlerName,
      matchRules,
    });

    const battingTeamName = battingTeam === "teamA" ? teamAName : teamBName;
    useScorecardStore.getState().initScorecard({
      teamA: teamAName,
      teamB: teamBName,
      tossWonBy,
      optedTo,
      matchRules,
      maxOvers: parseInt(overs, 10),
      battingTeamId: battingTeam,
      battingTeamName,
    });

    router.push("/scoring");
  };

  return {
    startMatch,
  };
};
