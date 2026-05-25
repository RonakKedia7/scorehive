import { useMemo } from "react";
import {
  useCurrentInnings,
  useInnings1,
  useInnings2,
  useTeamA,
  useTeamB,
} from "./useMatchState";
import { useScoringStore } from "@/stores/useScoringStore";

export const useInnings = () => {
  const currentInnings = useCurrentInnings();
  const innings1 = useInnings1();
  const innings2 = useInnings2();
  const teamA = useTeamA();
  const teamB = useTeamB();

  const players = useScoringStore((s) => s.players);

  const innings = currentInnings === 1 ? innings1 : innings2;

  return useMemo(() => {
    return {
      currentInnings,
      innings,
      teamA,
      teamB,
      players,
    };
  }, [currentInnings, innings, teamA, teamB, players]);
};
