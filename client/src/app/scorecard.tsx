import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from "react";

import ScorecardHeader from "@/components/scorecard/ScorecardHeader";
import MatchSummary from "@/components/scorecard/MatchSummary";
import InningsTabs from "@/components/scorecard/InningsTabs";
import InningsScorecard from "@/components/scorecard/InningsScorecard";
import { useScoringStore } from "@/stores/useScoringStore";
import {
  selectInningsScorecard,
  selectMatchResult,
} from "@/stores/selectors/scorecardSelectors";

const ScorecardScreen = () => {
  const scoringState = useScoringStore();
  const [selectedInnings, setSelectedInnings] = useState(0);

  // Derive the two innings scorecards
  const innings1Scorecard = useMemo(
    () => selectInningsScorecard(scoringState, 1),
    [scoringState],
  );
  const innings2Scorecard = useMemo(
    () => selectInningsScorecard(scoringState, 2),
    [scoringState],
  );

  const matchResult = useMemo(
    () => selectMatchResult(scoringState),
    [scoringState],
  );

  const inningsList = [innings1Scorecard, innings2Scorecard].filter(
    (inn): inn is NonNullable<typeof inn> => inn !== null,
  );

  if (inningsList.length === 0) return null;

  const currentInningsData = inningsList[selectedInnings];

  const matchForSummary = useMemo(
    () => ({
      id: "current",
      teamA: scoringState.teamA.name,
      teamB: scoringState.teamB.name,
      tossWonBy: "", // not used in summary
      optedTo: "", // not used in summary
      matchRules: scoringState.matchRules,
      maxOvers: scoringState.maxOvers,
      innings: inningsList,
      startTime: new Date().toISOString(),
      endTime: undefined,
      result: matchResult,
    }),
    [scoringState, inningsList, matchResult],
  );

  const data = [
    { type: "header" },
    { type: "summary" },
    { type: "tabs" },
    { type: "innings" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlashList
        data={data}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => item.type + index}
        renderItem={({ item }) => {
          switch (item.type) {
            case "header":
              return <ScorecardHeader />;
            case "summary":
              return <MatchSummary match={matchForSummary} />;
            case "tabs":
              return (
                <InningsTabs
                  match={matchForSummary}
                  innings={inningsList}
                  selectedInnings={selectedInnings}
                  onSelect={setSelectedInnings}
                />
              );
            case "innings":
              return <InningsScorecard innings={currentInningsData} />;
            default:
              return null;
          }
        }}
      />
    </SafeAreaView>
  );
};

export default ScorecardScreen;
