import { InningsScorecard } from "@/types/scorecard";
import { View, Text } from "react-native";

const InningsHero = ({ innings }: { innings: InningsScorecard }) => {
  const overs = Math.floor(innings.totalOvers);
  const balls = Math.round((innings.totalOvers - overs) * 10);

  const actualOvers = overs + balls / 6;

  const rr =
    actualOvers > 0 ? (innings.totalRuns / actualOvers).toFixed(2) : "0.00";

  return (
    <View className="mx-4 mt-4 bg-surface rounded-card border border-border-light overflow-hidden">
      <View className="p-card">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-text-tertiary text-[11px] font-bold tracking-[2px]">
              INNINGS
            </Text>

            <Text className="text-text-primary text-3xl font-black mt-1">
              {innings.battingTeamName}
            </Text>
          </View>

          <View className="bg-surfaceSecondary px-4 py-3 rounded-card items-center">
            <Text className="text-text-tertiary text-[10px] font-bold">
              RUN RATE
            </Text>

            <Text className="text-text-primary text-xl font-black mt-0.5">
              {rr}
            </Text>
          </View>
        </View>

        <View className="flex-row items-end mt-2">
          <Text className="text-[58px] leading-[62px] font-black text-text-primary">
            {innings.totalRuns}
          </Text>

          <Text className="text-[38px] leading-[44px] font-black text-danger ml-1">
            /{innings.wickets}
          </Text>

          <Text className="text-text-secondary text-xl font-bold ml-4 mb-2">
            ({innings.totalOvers.toFixed(1)})
          </Text>
        </View>
      </View>
    </View>
  );
};

export default InningsHero;
