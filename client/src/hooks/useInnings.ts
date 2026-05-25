import { useMemo } from "react";
import {
  useCurrentInnings,
  useInnings1,
  useInnings2,
  useTeamA,
  useTeamB,
} from "./useMatchState";

export const useInnings = () => {
  const currentInnings = useCurrentInnings();
  const innings1 = useInnings1();
  const innings2 = useInnings2();
  const teamA = useTeamA();
  const teamB = useTeamB();

  const innings = currentInnings === 1 ? innings1 : innings2;

  return useMemo(() => {
    return {
      currentInnings,
      innings,
      teamA,
      teamB,
    };
  }, [currentInnings, innings, teamA, teamB]);
};
