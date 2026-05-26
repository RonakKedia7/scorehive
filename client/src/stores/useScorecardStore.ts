import { create } from "zustand";
import {
  MatchScorecard,
  InningsScorecard,
  BallDetail,
  BowlingScorecardEntry,
  BattingScorecardEntry,
} from "@/types/scorecard";
import { MatchRules } from "@/types";

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
      overs: number;
      balls: number;
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

      // Assign ball index
      const ballWithIndex = { ...ballDetail, ballIndex: innings.balls.length };
      const updatedBalls = [...innings.balls, ballWithIndex];

      // Helpers
      const formatOvers = (overs: number) =>
        `${Math.floor(overs)}.${Math.round((overs - Math.floor(overs)) * 10)}`;

      // --- Partnership tracking ---
      let partnership = innings.currentPartnership + ballDetail.runs;

      // --- Batsmen ---
      let batsmen = [...innings.batsmen];
      let strikerEntry = batsmen.find(
        (b) => b.playerId === ballDetail.strikerId,
      );
      if (!strikerEntry) {
        strikerEntry = {
          playerId: ballDetail.strikerId,
          name: ballDetail.strikerName,
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
          ? (strikerEntry.runs / strikerEntry.balls) * 100
          : 0;

      // --- Fall of wicket & dismissal ---
      let fallOfWickets = [...innings.fallOfWickets];
      if (ballDetail.isWicket) {
        // Build dismissal description
        const dismissal = ballDetail.wicketType ?? "out";
        strikerEntry.dismissal = dismissal;

        // Record fall of wicket
        const newTotalRuns = innings.totalRuns + ballDetail.runs;
        const newWickets = innings.wickets + 1;
        const oversAt = formatOvers(innings.totalOvers); // overs at this moment
        fallOfWickets.push({
          wicketNumber: newWickets,
          runsAt: newTotalRuns,
          partnershipRuns: partnership,
          oversAt,
          batsmanOutId: strikerEntry.playerId,
        });

        // Reset partnership after wicket
        partnership = 0;

        // New batsman
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
        const completedOvers = Math.floor(totalBalls / 6);
        const remainingBalls = totalBalls % 6;
        bowlerEntry.overs = completedOvers + remainingBalls * 0.1;
      }
      if (ballDetail.isBowlerWicket) {
        bowlerEntry.wickets += 1;
      }
      bowlerEntry.economy =
        bowlerEntry.overs > 0 ? bowlerEntry.runs / bowlerEntry.overs : 0;

      // Maiden over
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

      let newTotalOvers = innings.totalOvers;
      if (ballDetail.isLegal) {
        const currentOvers = Math.floor(innings.totalOvers);
        const currentBalls = Math.round(
          (innings.totalOvers - currentOvers) * 10,
        );
        let newBalls = currentBalls + 1;
        if (newBalls === 6) {
          newTotalOvers = currentOvers + 1;
        } else {
          newTotalOvers = currentOvers + newBalls * 0.1;
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

      console.log("Scorecard after ball:", updatedInnings);
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

      // Update existing batsmen entries
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
              dismissal: existing.dismissal, // Keep existing dismissal info
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
              dismissal: undefined, // DNB
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
            return {
              ...existing,
              name: updated.name,
              overs: updated.overs + updated.balls / 10,
              maidens: updated.maidens,
              runs: updated.runs,
              wickets: updated.wickets,
              economy: updated.economy,
              legalBalls: updated.balls + updated.overs * 6,
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
