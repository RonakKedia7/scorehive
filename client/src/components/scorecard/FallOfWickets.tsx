import { InningsScorecard } from "@/types/scorecard";
import { View, Text } from "react-native";

const FallOfWickets = ({ innings }: { innings: InningsScorecard }) => {
  if (!innings.fallOfWickets?.length) return null;

  return (
    <View className="mx-4 mt-4 bg-surface rounded-card border border-border-light overflow-hidden">
      {/* HEADER */}
      <View className="px-5 py-3 bg-surfaceSecondary border-b border-border-light">
        <Text className="text-text-secondary text-[11px] font-black tracking-[1px] uppercase">
          Fall of Wickets
        </Text>
      </View>

      {/* LIST */}
      <View className="p-4">
        {innings.fallOfWickets.map((fow: any, index: number) => {
          const batter = innings.batsmen.find(
            (b: any) => b.playerId === fow.batsmanOutId,
          );

          return (
            <View key={fow.wicketNumber} className="flex-row items-center py-3">
              {/* CONTENT */}
              <View className="flex-1 ml-3 border-b border-border-light pb-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-text-primary font-black text-sm">
                    {batter?.name || "Unknown"}
                  </Text>

                  <Text className="text-text-secondary font-black text-sm">
                    {fow.runsAt}/{fow.wicketNumber}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between mt-1">
                  <Text className="text-text-secondary text-xs">
                    {fow.oversAt} ov
                  </Text>

                  <Text className="text-text-tertiary text-xs font-bold">
                    P’ship {fow.partnershipRuns}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default FallOfWickets;
