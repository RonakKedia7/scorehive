import { MatchScorecard } from "@/types/scorecard";
import { View, Text } from "react-native";

const MatchSummary = ({ match }: { match: MatchScorecard }) => {
  const tossWinner = match.tossWonBy === "teamA" ? match.teamA : match.teamB;
  const action = match.optedTo === "bat" ? "bat first" : "bowl first";

  return (
    <View className="mx-4 mt-4 bg-surface rounded-card border border-border-light overflow-hidden">
      <View className="p-5">
        <Text className="text-text-primary text-3xl font-black">
          {match.teamA}{" "}
          <Text className="text-text-secondary text-2xl font-bold">vs</Text>{" "}
          {match.teamB}
        </Text>

        <View className="mt-4 pt-3 border-t border-border-light">
          <Text className="text-text-secondary text-sm">
            <Text className="text-primary-500 font-semibold">{tossWinner}</Text>{" "}
            won the toss & chose to {action}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MatchSummary;
