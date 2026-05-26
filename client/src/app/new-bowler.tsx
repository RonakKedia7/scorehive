import { Colors } from "@/constants/colors";
import { useScoringStore } from "@/stores/useScoringStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NewBowlerScreen = () => {
  const router = useRouter();
  const { startNewOverWithBowler, clearOverCompleted } = useScoringStore();
  const [newBowlerName, setNewBowlerName] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!newBowlerName.trim() || newBowlerName.trim().length < 3) {
      setError("Please enter a valid bowler name");
      return;
    }
    startNewOverWithBowler(newBowlerName.trim());
    clearOverCompleted();
    router.back();
  };
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1 px-4"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        {/* HEADER */}
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="rounded-xl p-3"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </Pressable>

          <Text className="text-2xl font-extrabold tracking-tight text-text-primary">
            New Bowler
          </Text>

          <View className="w-[60px]" />
        </View>

        {/* NEW BOWLER */}
        <View className="mb-4 rounded-2xl border border-border-light bg-surface p-5 shadow-card">
          <Text className="mb-3 text-lg font-bold text-text-primary">
            New Bowler Name
          </Text>

          <TextInput
            value={newBowlerName}
            onChangeText={(text) => {
              setError("");
              setNewBowlerName(text);
            }}
            placeholder="Enter new bowler name"
            placeholderTextColor={Colors.placeholder}
            className="rounded-xl border border-border-light bg-background px-4 py-3 text-base text-text-primary"
            style={{ fontSize: 16 }}
            cursorColor={Colors.primary.DEFAULT}
            selectionColor={Colors.primary.DEFAULT}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>

        {/* ERROR */}
        {error ? (
          <View className="mb-5 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3">
            <Text className="text-sm font-semibold text-danger">{error}</Text>
          </View>
        ) : null}

        {/* SAVE BUTTON */}
        <Pressable
          onPress={handleSave}
          className="items-center rounded-xl bg-primary py-4 shadow-card"
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <Text className="text-base font-bold text-text-inverse">
            Save Settings
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewBowlerScreen;
