import { create } from "zustand";
import {
  MatchScorecard,
  InningsScorecard,
  BallDetail,
  BowlingScorecardEntry,
  BattingScorecardEntry,
} from "@/types/scorecard";
import { MatchRules } from "@/types";

// Helper: convert total balls to display overs (e.g., 13 balls → 2.1)
const ballsToOvers = (totalBalls: number): number => {
  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  return Number((overs + balls * 0.1).toFixed(1));
};

// Helper: convert display overs (e.g., 2.1) to total balls
const oversToBalls = (displayOvers: number): number => {
  const overs = Math.floor(displayOvers);
  const balls = Math.round((displayOvers - overs) * 10);
  return overs * 6 + balls;
};

interface ScorecardState {
  match: MatchScorecard | null;

  initScorecard: (params: {
    teamA: string;
    teamB: string;
    tossWonBy: string;
    optedTo: string;
    matchRules: MatchRules;
    maxOvers: number;
    battingTeamId: string;
    battingTeamName: string;
  }) => void;

  recordBall: (ballDetail: BallDetail) => void;

  closeInnings: (params: {
    batsmen: Array<{
      playerId: string;
      name: string;
      runs: number;
      balls: number;
      fours: number;
      sixes: number;
      strikeRate: number;
      dismissal?: string;
    }>;
    bowlers: Array<{
      playerId: string;
      name: string;
      overs: number; // completed overs (e.g., 3)
      balls: number; // balls in current over (0-5)
      maidens: number;
      runs: number;
      wickets: number;
      economy: number;
    }>;
    allTeamPlayerIds: string[];
    allTeamPlayers: Array<{ id: string; name: string }>;
  }) => void;

  startNewInnings: (battingTeamId: string, battingTeamName: string) => void;
}

const createEmptyInningsScorecard = (
  battingTeamId: string,
  battingTeamName: string,
): InningsScorecard => ({
  battingTeamId,
  battingTeamName,
  totalRuns: 0,
  wickets: 0,
  totalOvers: 0,
  extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
  batsmen: [],
  bowlers: [],
  fallOfWickets: [],
  balls: [],
  currentPartnership: 0,
});

export const useScorecardStore = create<ScorecardState>((set, get) => ({
  match: null,

  initScorecard: (params) => {
    const match: MatchScorecard = {
      id: Date.now().toString(),
      teamA: params.teamA,
      teamB: params.teamB,
      tossWonBy: params.tossWonBy,
      optedTo: params.optedTo,
      matchRules: params.matchRules,
      maxOvers: params.maxOvers,
      innings: [
        createEmptyInningsScorecard(
          params.battingTeamId,
          params.battingTeamName,
        ),
      ],
      startTime: new Date().toISOString(),
    };
    set({ match });
  },

  recordBall: (ballDetail) => {
    set((state) => {
      if (!state.match) return state;

      const inningsIndex = state.match.innings.length - 1;
      const innings = { ...state.match.innings[inningsIndex] };

      const ballWithIndex = { ...ballDetail, ballIndex: innings.balls.length };
      const updatedBalls = [...innings.balls, ballWithIndex];

      // Current total balls in innings (legal deliveries)
      const currentTotalBalls = oversToBalls(innings.totalOvers);
      let newTotalBalls = currentTotalBalls;
      if (ballDetail.isLegal) {
        newTotalBalls = currentTotalBalls + 1;
      }
      const newTotalOvers = ballsToOvers(newTotalBalls);

      let partnership = innings.currentPartnership + ballDetail.runs;

      // --- Batsmen ---
      let batsmen = [...innings.batsmen];
      let strikerEntry = batsmen.find(
        (b) => b.playerId === ballDetail.facingStrikerId,
      );
      if (!strikerEntry) {
        strikerEntry = {
          playerId: ballDetail.facingStrikerId,
          name: ballDetail.facingStrikerName,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
        };
        batsmen.push(strikerEntry);
      }

      if (ballDetail.isLegal) {
        strikerEntry.balls += 1;
      }
      strikerEntry.runs += ballDetail.batterRuns;
      if (ballDetail.batterRuns === 4) strikerEntry.fours += 1;
      if (ballDetail.batterRuns === 6) strikerEntry.sixes += 1;
      strikerEntry.strikeRate =
        strikerEntry.balls > 0
          ? Number(((strikerEntry.runs / strikerEntry.balls) * 100).toFixed(2))
          : 0;

      // --- Fall of wicket & dismissal ---
      let fallOfWickets = [...innings.fallOfWickets];
      if (ballDetail.isWicket) {
        strikerEntry.dismissal =
          ballDetail.dismissalString ?? ballDetail.wicketType ?? "out";

        const newTotalRuns = innings.totalRuns + ballDetail.runs;
        const newWickets = innings.wickets + 1;
        const oversAt = newTotalOvers.toFixed(1); // e.g. "5.3"
        fallOfWickets.push({
          wicketNumber: newWickets,
          runsAt: newTotalRuns,
          partnershipRuns: partnership,
          oversAt,
          batsmanOutId: strikerEntry.playerId,
        });

        partnership = 0;

        if (ballDetail.newBatsmanId) {
          if (!batsmen.find((b) => b.playerId === ballDetail.newBatsmanId)) {
            batsmen.push({
              playerId: ballDetail.newBatsmanId,
              name: ballDetail.newBatsmanName || "Unknown",
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              strikeRate: 0,
            });
          }
        }
      }

      // --- Bowlers ---
      let bowlers = [...innings.bowlers];
      let bowlerEntry = bowlers.find((b) => b.playerId === ballDetail.bowlerId);
      if (!bowlerEntry) {
        bowlerEntry = {
          playerId: ballDetail.bowlerId,
          name: ballDetail.bowlerName,
          overs: 0,
          maidens: 0,
          runs: 0,
          wickets: 0,
          economy: 0,
          legalBalls: 0,
        };
        bowlers.push(bowlerEntry);
      }

      bowlerEntry.runs += ballDetail.bowlerRuns;
      if (ballDetail.isLegal) {
        bowlerEntry.legalBalls += 1;
        const totalBalls = bowlerEntry.legalBalls;
        bowlerEntry.overs = Math.floor(totalBalls / 6);
        // Display overs stored separately? We'll keep overs as decimal for convenience
        // But for final closeInnings we'll use overs+balls.
      }

      if (ballDetail.isBowlerWicket) {
        bowlerEntry.wickets += 1;
      }

      const totalOversBowled = bowlerEntry.legalBalls / 6;
      bowlerEntry.economy =
        totalOversBowled > 0
          ? Number((bowlerEntry.runs / totalOversBowled).toFixed(2))
          : 0;

      if (ballDetail.overComplete && ballDetail.overRuns === 0) {
        bowlerEntry.maidens += 1;
      }

      // --- Innings totals ---
      const newTotalRuns = innings.totalRuns + ballDetail.runs;
      const newWickets = innings.wickets + (ballDetail.isWicket ? 1 : 0);
      const newExtras = { ...innings.extras };
      if (ballDetail.extraType) {
        switch (ballDetail.extraType) {
          case "wide":
            newExtras.wides += ballDetail.extraRuns;
            break;
          case "noBall":
            newExtras.noBalls += ballDetail.extraRuns;
            break;
          case "bye":
            newExtras.byes += ballDetail.extraRuns;
            break;
          case "legBye":
            newExtras.legByes += ballDetail.extraRuns;
            break;
        }
      }

      const updatedInnings: InningsScorecard = {
        ...innings,
        balls: updatedBalls,
        totalRuns: newTotalRuns,
        wickets: newWickets,
        extras: newExtras,
        totalOvers: newTotalOvers,
        batsmen,
        bowlers,
        fallOfWickets,
        currentPartnership: partnership,
      };

      const newInnings = [...state.match.innings];
      newInnings[inningsIndex] = updatedInnings;

      return { match: { ...state.match, innings: newInnings } };
    });
  },

  closeInnings: (params) => {
    set((state) => {
      if (!state.match) return state;

      const inningsIndex = state.match.innings.length - 1;
      const innings = { ...state.match.innings[inningsIndex] };

      // --- Batsmen: overwrite with final data + DNB ---
      const battedIds = params.batsmen.map((b) => b.playerId);

      let finalBatsmen: BattingScorecardEntry[] = innings.batsmen.map(
        (existing) => {
          const updated = params.batsmen.find(
            (b) => b.playerId === existing.playerId,
          );
          if (updated) {
            return {
              ...existing,
              name: updated.name,
              runs: updated.runs,
              balls: updated.balls,
              fours: updated.fours,
              sixes: updated.sixes,
              strikeRate: updated.strikeRate,
              dismissal: existing.dismissal,
            };
          }
          return existing;
        },
      );

      // Add DNB for players who never batted
      params.allTeamPlayerIds.forEach((playerId) => {
        if (!battedIds.includes(playerId)) {
          const player = params.allTeamPlayers.find((p) => p.id === playerId);
          if (player) {
            finalBatsmen.push({
              playerId: player.id,
              name: player.name,
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              strikeRate: 0,
              dismissal: undefined,
            });
          }
        }
      });

      // --- Bowlers: overwrite with final data ---
      const finalBowlers: BowlingScorecardEntry[] = innings.bowlers.map(
        (existing) => {
          const updated = params.bowlers.find(
            (b) => b.playerId === existing.playerId,
          );
          if (updated) {
            // Convert overs (integer) + balls (0-5) to display overs (e.g., 3.4)
            const displayOvers = updated.overs + updated.balls * 0.1;
            return {
              ...existing,
              name: updated.name,
              overs: displayOvers,
              maidens: updated.maidens,
              runs: updated.runs,
              wickets: updated.wickets,
              economy: updated.economy,
              legalBalls: updated.overs * 6 + updated.balls,
            };
          }
          return existing;
        },
      );

      const finalizedInnings: InningsScorecard = {
        ...innings,
        batsmen: finalBatsmen,
        bowlers: finalBowlers,
      };

      const newInnings = [...state.match.innings];
      newInnings[inningsIndex] = finalizedInnings;

      const isMatchComplete = inningsIndex === 1;
      return {
        match: {
          ...state.match,
          innings: newInnings,
          endTime: isMatchComplete
            ? new Date().toISOString()
            : state.match.endTime,
        },
      };
    });
  },

  startNewInnings: (battingTeamId, battingTeamName) => {
    set((state) => {
      if (!state.match) return state;
      const newInnings = createEmptyInningsScorecard(
        battingTeamId,
        battingTeamName,
      );
      return {
        match: {
          ...state.match,
          innings: [...state.match.innings, newInnings],
        },
      };
    });
  },
}));
