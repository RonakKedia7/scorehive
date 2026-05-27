import { View, Pressable, Text, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { generateScorecardHTML } from "@/utils/generateScorecardPDF";
import { useScoringStore } from "@/stores/useScoringStore";
import { useInitialMatchSetup } from "@/stores/useInitialMatchSetup";
import * as Print from "expo-print";

const ScorecardHeader = () => {
  const router = useRouter();

  const scoringState = useScoringStore();
  const { tossWonBy, optedTo, teamA, teamB } = useInitialMatchSetup();
  const tossWinnerName = tossWonBy === "teamA" ? teamA : teamB;

  const handleSavePDF = async () => {
    try {
      const html = generateScorecardHTML(scoringState, tossWinnerName, optedTo);

      await Print.printAsync({
        html,
      });
    } catch (error) {
      console.error("PDF ERROR:", error);
      Alert.alert("Error", "Failed to open print dialog");
    }
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-3 border border-border-light bg-surface">
      <Pressable
        onPress={() => router.back()}
        className="w-11 h-11 rounded-card items-center justify-center"
      >
        <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
      </Pressable>

      <Text className="text-lg font-black text-text-primary">Scorecard</Text>

      <Pressable
        onPress={handleSavePDF}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
        className="size-10 rounded-full bg-primary items-center justify-center"
      >
        <Ionicons name="share-outline" size={18} color={Colors.text.inverse} />
      </Pressable>
    </View>
  );
};

export default ScorecardHeader;
