import { useScoringStore } from "@/stores/useScoringStore";

export const useCurrentInnings = () => useScoringStore((s) => s.currentInnings);

export const useInnings1 = () => useScoringStore((s) => s.innings1);

export const useInnings2 = () => useScoringStore((s) => s.innings2);

export const useTeamA = () => useScoringStore((s) => s.teamA);

export const useTeamB = () => useScoringStore((s) => s.teamB);
