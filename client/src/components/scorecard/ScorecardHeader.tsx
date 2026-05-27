import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";

const ScorecardHeader = () => {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4 py-3 border border-border-light bg-surface">
      <Pressable
        onPress={() => router.back()}
        className="w-11 h-11 rounded-card items-center justify-center"
      >
        <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
      </Pressable>

      <Text className="text-lg font-black text-text-primary">Scorecard</Text>

      <Pressable className="w-10 h-10 rounded-full bg-primary items-center justify-center">
        <Ionicons name="share-outline" size={18} color={Colors.text.inverse} />
      </Pressable>
    </View>
  );
};

export default ScorecardHeader;
