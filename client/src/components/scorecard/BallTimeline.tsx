import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { InningsScorecard } from "@/types/scorecard";

const BallTimeline = ({ innings }: { innings: InningsScorecard }) => {
  // GROUP BALLS BY OVER
  const oversMap: Record<string, any[]> = {};

  innings.balls.forEach((ball: any) => {
    const overKey = ball.overNumber.toString();

    if (!oversMap[overKey]) {
      oversMap[overKey] = [];
    }

    oversMap[overKey].push(ball);
  });

  // LATEST OVER FIRST
  const overs = Object.entries(oversMap).reverse();

  return (
    <View className="mx-4 mt-4 bg-surface rounded-card border border-border-light overflow-hidden">
      {/* HEADER */}
      <View className="px-5 py-3 bg-surfaceSecondary border-b border-border-light">
        <Text className="text-text-secondary text-[11px] font-black tracking-[1px] uppercase">
          Ball Timeline
        </Text>
      </View>

      {/* OVERS */}
      <FlashList
        data={overs}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const [overNumber, balls] = item;
          const displayOver = Number(overNumber) + 1;
          const legalBallsForCount = balls.filter(
            (b) => b.result !== "RH" && b.result !== "RO",
          );

          return (
            <View className="mb-4">
              {/* OVER HEADER */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-text-primary font-black text-sm">
                  Over {displayOver}
                </Text>

                <Text className="text-text-tertiary text-xs">
                  {legalBallsForCount.length} balls
                </Text>
              </View>

              {/* BALLS */}
              <View className="flex-row flex-wrap gap-2">
                {balls.map((ball: any, index: number) => {
                  const isRetirement =
                    ball.result === "RH" || ball.result === "RO";
                  const isWicket = ball.isWicket === true && !isRetirement;
                  const isBoundary = ball.runs === 4 || ball.runs === 6;
                  const isExtra =
                    ball.extraType !== null && ball.extraType !== undefined;
                  const displayText = isRetirement
                    ? ball.result === "RH"
                      ? "RH"
                      : "RO"
                    : ball.result || ball.runs.toString();

                  return (
                    <View
                      key={index}
                      className={`w-11 h-11 rounded-full items-center justify-center border
        ${
          isRetirement
            ? "bg-surfaceSecondary border-border-light"
            : isWicket
              ? "bg-danger border-danger-dark"
              : isBoundary
                ? "bg-secondary border-secondary-700"
                : isExtra
                  ? "bg-warning border-warning-dark"
                  : "bg-surfaceSecondary border-border-light"
        }`}
                    >
                      <Text
                        className={`font-black text-base ${isRetirement ? "text-text-secondary" : isWicket || isBoundary || isExtra ? "text-text-inverse" : "text-text-primary"}`}
                      >
                        {displayText}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View className="mt-4 border-b border-border-light/40" />
            </View>
          );
        }}
      />
    </View>
  );
};

export default BallTimeline;
