import { InningsScorecard } from "@/types/scorecard";
import { View, Text } from "react-native";

const ExtrasCard = ({ innings }: { innings: InningsScorecard }) => {
  const extras = innings.extras;

  const total = extras.wides + extras.noBalls + extras.byes + extras.legByes;

  return (
    <View className="mx-4 mt-4 bg-surface rounded-card border border-border-light overflow-hidden">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-surfaceSecondary border-b border-border-light">
        <Text className="text-text-secondary text-[11px] font-black tracking-[1px] uppercase">
          Extras
        </Text>

        <Text className="text-text-primary text-lg font-black">{total}</Text>
      </View>

      {/* ROWS */}
      <View className="px-5 py-3">
        <View className="flex-row justify-between py-2">
          <Text className="text-text-secondary text-sm">Wides</Text>
          <Text className="text-text-primary font-black">{extras.wides}</Text>
        </View>

        <View className="flex-row justify-between py-2">
          <Text className="text-text-secondary text-sm">No Balls</Text>
          <Text className="text-text-primary font-black">{extras.noBalls}</Text>
        </View>

        <View className="flex-row justify-between py-2">
          <Text className="text-text-secondary text-sm">Byes</Text>
          <Text className="text-text-primary font-black">{extras.byes}</Text>
        </View>

        <View className="flex-row justify-between py-2">
          <Text className="text-text-secondary text-sm">Leg Byes</Text>
          <Text className="text-text-primary font-black">{extras.legByes}</Text>
        </View>
      </View>
    </View>
  );
};

export default ExtrasCard;
