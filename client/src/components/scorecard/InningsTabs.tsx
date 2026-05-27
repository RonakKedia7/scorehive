import { View, Pressable, Text } from "react-native";
import { MatchScorecard } from "@/types/scorecard";

const InningsTabs = ({
  match,
  innings,
  selectedInnings,
  onSelect,
}: {
  match: MatchScorecard;
  innings: MatchScorecard["innings"];
  selectedInnings: number;
  onSelect: (index: number) => void;
}) => {
  return (
    <View className="flex-row mx-4 mt-3 gap-2">
      {/* FIRST INNINGS */}
      <Pressable
        onPress={() => onSelect(0)}
        className={`flex-1 rounded-2xl border items-center justify-center py-2.5 ${
          selectedInnings === 0
            ? "bg-primary border-primary"
            : "bg-surface border-border-light"
        }`}
      >
        <Text
          className={`text-[15px] font-black tracking-wide ${
            selectedInnings === 0 ? "text-text-inverse" : "text-text-primary"
          }`}
        >
          {innings[0]?.battingTeamName ?? "1st Innings"}
        </Text>
      </Pressable>

      {/* SECOND INNINGS */}
      <Pressable
        onPress={() => innings[1] && onSelect(1)}
        disabled={!innings[1]}
        className={`flex-1 rounded-2xl border items-center justify-center py-2.5 ${
          selectedInnings === 1
            ? "bg-primary border-primary"
            : !innings[1]
              ? "bg-surface border-border-light opacity-50"
              : "bg-surface border-border-light"
        }`}
      >
        <Text
          className={`text-[15px] font-black tracking-wide ${
            selectedInnings === 1
              ? "text-text-inverse"
              : !innings[1]
                ? "text-text-tertiary"
                : "text-text-primary"
          }`}
        >
          {(innings[1]?.battingTeamName ??
          innings[0]?.battingTeamName === match.teamA)
            ? match.teamB
            : match.teamA}
        </Text>

        {!innings[1] && (
          <Text className="text-[10px] text-text-tertiary mt-0.5">
            Yet to start
          </Text>
        )}
      </Pressable>
    </View>
  );
};

export default InningsTabs;
