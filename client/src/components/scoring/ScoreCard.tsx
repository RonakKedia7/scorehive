import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useInnings } from "@/hooks/useInnings";
import { formatBallResult, ParsedBall } from "@/utils/ballHelpers";

const ScoreCard = () => {
  const { innings, currentInnings, teamA, teamB } = useInnings();

  const battingTeam = innings.battingTeam === "teamA" ? teamA : teamB;
  const crr =
    innings.overs + innings.ballsInOver / 6 > 0
      ? (innings.totalRuns / (innings.overs + innings.ballsInOver / 6)).toFixed(
          2,
        )
      : "0.00";

  return (
    <View className="mx-4 bg-surface rounded-b-card border border-t-0 border-border-light shadow-card-md overflow-hidden">
      {/* TOP */}
      <View className="p-card">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-text-tertiary text-[11px] font-bold tracking-[2px]">
              INNINGS {currentInnings}
            </Text>

            <Text className="text-text-primary text-3xl font-black mt-1">
              {battingTeam.name}
            </Text>
          </View>

          <View className="bg-surface px-4 py-3 rounded-card items-center ">
            <Text className="text-text-tertiary text-[10px] font-bold">
              CURRENT RR
            </Text>

            <Text className="text-text-primary text-xl font-black mt-0.5">
              {crr}
            </Text>
          </View>
        </View>

        {/* SCORE */}
        <View className="flex-row items-end mt-2">
          <Text className="text-[58px] leading-[62px] font-black text-text-primary">
            {innings.totalRuns}
          </Text>

          <Text className="text-[38px] leading-[44px] font-black text-danger ml-1">
            /{innings.wickets}
          </Text>

          <Text className="text-text-secondary text-xl font-bold ml-4 mb-2">
            ({innings.overs}.{innings.ballsInOver})
          </Text>
        </View>
      </View>

      {/* THIS OVER */}
      <View className="border-t border-border-light bg-surfaceSecondary px-5 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-text-primary text-sm font-black tracking-wide">
            THIS OVER
          </Text>
        </View>

        <View className="h-[46px]">
          <FlashList
            data={innings.thisOver as ParsedBall[]} // ensure type
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()} // use index as key (stable for fixed list)
            ItemSeparatorComponent={() => <View className="w-3" />}
            renderItem={({ item }) => {
              const isWicket = item.isWicket;
              const isExtra = item.extraType !== null;
              const isBoundary =
                !isExtra && (item.batterRuns === 4 || item.batterRuns === 6);

              const displayText = formatBallResult(item);

              return (
                <View
                  className={`w-[46px] h-[46px] rounded-full items-center justify-center border
          ${
            isWicket
              ? "bg-danger border-danger-dark"
              : isBoundary
                ? "bg-secondary border-secondary-700"
                : isExtra
                  ? "bg-warning border-warning-dark"
                  : "bg-surface border-border-light"
          }`}
                >
                  <Text
                    className={`font-black text-base
            ${
              isWicket || isBoundary || isExtra
                ? "text-text-inverse"
                : "text-text-primary"
            }`}
                  >
                    {displayText}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default ScoreCard;
