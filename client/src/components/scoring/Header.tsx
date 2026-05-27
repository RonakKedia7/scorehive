import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { router } from "expo-router";

const Header = () => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 border border-border-light bg-surface">
      <Pressable
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
        className="w-11 h-11 rounded-card items-center justify-center"
      >
        <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
      </Pressable>

      <Pressable
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
        onPress={() => router.push("/scorecard")}
        className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center shadow-card-sm"
      >
        <Ionicons name="stats-chart" size={18} color={Colors.text.inverse} />
      </Pressable>
    </View>
  );
};

export default Header;
