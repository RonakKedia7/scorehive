import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import ScorecardHeader from "@/components/scorecard/ScorecardHeader";
import MatchSummary from "@/components/scorecard/MatchSummary";
import InningsTabs from "@/components/scorecard/InningsTabs";
import InningsScorecard from "@/components/scorecard/InningsScorecard";
import { useScorecardStore } from "@/stores/useScorecardStore";

const ScorecardScreen = () => {
  const match = useScorecardStore((s) => s.match);
  const [selectedInnings, setSelectedInnings] = useState(0);

  if (!match) return null;

  const innings = match.innings[selectedInnings];

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
              return <MatchSummary match={match} />;

            case "tabs":
              return (
                <InningsTabs
                  match={match}
                  innings={match.innings}
                  selectedInnings={selectedInnings}
                  onSelect={setSelectedInnings}
                />
              );

            case "innings":
              return <InningsScorecard innings={innings} />;

            default:
              return null;
          }
        }}
      />
    </SafeAreaView>
  );
};

export default ScorecardScreen;
