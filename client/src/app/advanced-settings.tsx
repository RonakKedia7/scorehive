import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useInitialMatchSetup } from "@/stores/useInitialMatchSetup";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Colors } from "@/constants/colors";

const AdvancedSettingsScreen = () => {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    matchRules,
    setPlayersPerTeam,
    toggleNoBall,
    setNoBallReBall,
    setNoBallRuns,
    toggleWide,
    setWideReBall,
    setWideRuns,
  } = useInitialMatchSetup();

  const handleSaveSettings = () => {
    if (!matchRules.playersPerTeam) {
      setError("Please enter players per team");
      return;
    }
    if (Number(matchRules.playersPerTeam) < 2) {
      setError("Players per team must be at least 2");
      return;
    }
    if (Number(matchRules.playersPerTeam) > 15) {
      setError("Players per team cannot exceed 15");
      return;
    }
    if (matchRules.noBall.enabled) {
      if (Number(matchRules.noBall.runs) < 0) {
        setError("No ball runs cannot be negative");
        return;
      }
      if (Number(matchRules.noBall.runs) > 10) {
        setError("No ball runs are too high");
        return;
      }
    }
    if (matchRules.wide.enabled) {
      if (Number(matchRules.wide.runs) < 0) {
        setError("Wide ball runs cannot be negative");
        return;
      }
      if (Number(matchRules.wide.runs) > 10) {
        setError("Wide ball runs are too high");
        return;
      }
    }
    setError("");
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 80,
          }}
        >
          {/* HEADER */}
          <View className="mb-4 flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className="rounded-xl bg-card p-3 active:bg-background"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.text.primary}
              />
            </Pressable>

            <Text className="text-2xl font-extrabold tracking-tight text-textPrimary">
              Settings
            </Text>

            <View className="w-[60px]" />
          </View>

          {/* PLAYERS PER TEAM */}
          <View className="mb-4 rounded-2xl border border-border-light bg-card p-5 shadow-card">
            <Text className="mb-3 text-lg font-bold text-textPrimary">
              Players Per Team
            </Text>

            <TextInput
              value={String(matchRules.playersPerTeam)}
              onChangeText={(text) => {
                setError("");
                setPlayersPerTeam(text);
              }}
              placeholder="11"
              placeholderTextColor={Colors.placeholder}
              keyboardType="numeric"
              className="rounded-xl border border-border-light bg-background px-4 py-3 text-base text-textPrimary"
              style={{ fontSize: 16 }}
            />
          </View>

          {/* NO BALL */}
          <View className="mb-4 rounded-2xl border border-border-light bg-card p-5 shadow-card">
            <Text className="mb-4 text-lg font-bold text-textPrimary">
              No Ball
            </Text>

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Text className="text-base font-medium text-textPrimary">
                  Enable
                </Text>
                <Switch
                  value={matchRules.noBall.enabled}
                  onValueChange={toggleNoBall}
                  trackColor={{
                    false: Colors.border.DEFAULT,
                    true: Colors.primary.DEFAULT,
                  }}
                  thumbColor={Colors.card}
                />
              </View>

              <View className="flex-row items-center">
                <Text className="text-base font-medium text-textPrimary">
                  Re-ball
                </Text>
                <Switch
                  value={matchRules.noBall.reBall}
                  onValueChange={setNoBallReBall}
                  trackColor={{
                    false: Colors.border.DEFAULT,
                    true: Colors.primary.DEFAULT,
                  }}
                  thumbColor={Colors.card}
                />
              </View>
            </View>

            <Text className="mb-2 text-base font-medium text-textPrimary">
              Runs
            </Text>
            <TextInput
              value={String(matchRules.noBall.runs)}
              onChangeText={(text) => {
                setError("");
                setNoBallRuns(text);
              }}
              placeholder="1"
              placeholderTextColor={Colors.placeholder}
              keyboardType="numeric"
              className="rounded-xl border border-border-light bg-background px-4 py-3 text-base text-textPrimary"
              style={{ fontSize: 16 }}
            />
          </View>

          {/* WIDE BALL */}
          <View className="mb-6 rounded-2xl border border-border-light bg-card p-5 shadow-card">
            <Text className="mb-4 text-lg font-bold text-textPrimary">
              Wide Ball
            </Text>

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Text className="text-base font-medium text-textPrimary">
                  Enable
                </Text>
                <Switch
                  value={matchRules.wide.enabled}
                  onValueChange={toggleWide}
                  trackColor={{
                    false: Colors.border.DEFAULT,
                    true: Colors.primary.DEFAULT,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View className="flex-row items-center">
                <Text className="text-base font-medium text-textPrimary">
                  Re-ball
                </Text>
                <Switch
                  value={matchRules.wide.reBall}
                  onValueChange={setWideReBall}
                  trackColor={{
                    false: Colors.border.DEFAULT,
                    true: Colors.primary.DEFAULT,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <Text className="mb-2 text-base font-medium text-textPrimary">
              Runs
            </Text>
            <TextInput
              value={String(matchRules.wide.runs)}
              onChangeText={(text) => {
                setError("");
                setWideRuns(text);
              }}
              placeholder="1"
              placeholderTextColor={Colors.placeholder}
              keyboardType="numeric"
              className="rounded-xl border border-border-light bg-background px-4 py-3 text-base text-textPrimary"
              style={{ fontSize: 16 }}
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
            onPress={handleSaveSettings}
            className="items-center rounded-xl bg-primary py-4 shadow-card"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Text className="text-base font-bold text-text-inverse">
              Save Settings
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AdvancedSettingsScreen;
