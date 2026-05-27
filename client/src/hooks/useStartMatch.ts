import { useRouter } from "expo-router";
import { useInitialMatchSetup } from "@/stores/useInitialMatchSetup";
import { useScoringStore } from "@/stores/useScoringStore";

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
      maxOvers: parseInt(overs, 10),
    });

    router.push("/scoring");
  };

  return {
    startMatch,
  };
};
