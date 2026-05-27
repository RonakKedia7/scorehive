import { InningsScorecard } from "@/types/scorecard";
import { View, Text } from "react-native";

const BowlingCard = ({ innings }: { innings: InningsScorecard }) => {
  return (
    <View className="mx-4 mt-4 bg-surface rounded-card border border-border-light overflow-hidden">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-surfaceSecondary border-b border-border-light">
        <Text className="text-text-secondary text-[11px] font-black tracking-[1px] uppercase">
          Bowling
        </Text>

        <View className="flex-row shrink-0">
          {["O", "M", "R", "W", "ER"].map((item, index) => (
            <Text
              key={item}
              className={`${
                index === 4 ? "w-12" : "w-8"
              } text-center text-text-tertiary text-[11px] font-black`}
            >
              {item}
            </Text>
          ))}
        </View>
      </View>

      {/* BOWLERS */}
      {innings.bowlers.map((bowler: any, index: number) => (
        <View
          key={bowler.playerId}
          className={`flex-row items-center px-5 py-4 ${
            index !== innings.bowlers.length - 1
              ? "border-b border-border-light"
              : ""
          }`}
        >
          {/* LEFT */}
          <View className="flex-1 pr-3">
            <Text
              numberOfLines={1}
              className="text-[15px] font-bold text-text-primary"
            >
              {bowler.name}
            </Text>
          </View>

          {/* RIGHT */}
          <View className="flex-row shrink-0 items-center">
            <Text className="w-8 text-center text-text-primary font-black text-sm">
              {bowler.overs.toFixed(1)}
            </Text>

            <Text className="w-8 text-center text-text-secondary text-sm">
              {bowler.maidens}
            </Text>

            <Text className="w-8 text-center text-text-secondary text-sm">
              {bowler.runs}
            </Text>

            <Text className="w-8 text-center text-text-secondary font-black text-sm">
              {bowler.wickets}
            </Text>

            <Text className="w-12 text-center text-text-secondary font-bold text-sm">
              {bowler.economy.toFixed(1)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default BowlingCard;
