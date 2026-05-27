import { BattingScorecardEntry, InningsScorecard } from "@/types/scorecard";
import { View, Text } from "react-native";

const BattingCard = ({ innings }: { innings: InningsScorecard }) => {
  return (
    <View className="mx-4 mt-4 bg-surface rounded-card border border-border-light overflow-hidden">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-surfaceSecondary border-b border-border-light">
        <Text className="text-text-secondary text-[11px] font-black tracking-[1px] uppercase">
          Batting
        </Text>

        <View className="flex-row shrink-0">
          {["R", "B", "4s", "6s", "SR"].map((item, index) => (
            <Text
              key={item}
              className={`text-center text-text-tertiary text-[11px] font-black ${
                index === 4 ? "w-12" : "w-8"
              }`}
            >
              {item}
            </Text>
          ))}
        </View>
      </View>

      {/* BATTERS */}
      {innings.batsmen.map((player: BattingScorecardEntry, index: number) => {
        const isOut = !!player.dismissal;

        return (
          <View
            key={player.playerId}
            className={`flex-row items-center px-5 py-4 ${
              index !== innings.batsmen.length - 1
                ? "border-b border-border-light"
                : ""
            } ${isOut ? "bg-surfaceSecondary/40" : "bg-surface"}`}
          >
            {/* PLAYER INFO */}
            <View className="flex-1 pr-3">
              <Text
                numberOfLines={1}
                className={`text-[15px] font-bold ${
                  isOut
                    ? "text-text-tertiary line-through"
                    : "text-text-primary"
                }`}
              >
                {player.name}
              </Text>

              <Text
                numberOfLines={1}
                className={`text-xs mt-1 ${
                  isOut ? "text-text-tertiary" : "text-text-secondary"
                }`}
              >
                {player.dismissal || "not out"}
              </Text>
            </View>

            {/* STATS */}
            <View className="flex-row shrink-0 items-center">
              <Text className="w-8 text-center text-text-primary font-black text-sm">
                {player.runs}
              </Text>

              <Text className="w-8 text-center text-text-secondary text-sm">
                {player.balls}
              </Text>

              <Text className="w-8 text-center text-text-secondary text-sm">
                {player.fours}
              </Text>

              <Text className="w-8 text-center text-text-secondary text-sm">
                {player.sixes}
              </Text>

              <Text className="w-12 text-center text-text-secondary font-bold text-sm">
                {player.strikeRate.toFixed(1)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default BattingCard;
