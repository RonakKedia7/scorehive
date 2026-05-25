import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useInitialMatchSetup } from "@/stores/useInitialMatchSetup";
import { useState } from "react";
import { Colors } from "@/constants/colors";

export default function HomeScreen() {
  const router = useRouter();

  const {
    teamA,
    setTeamA,
    teamB,
    setTeamB,
    tossWonBy,
    setTossWonBy,
    optedTo,
    setOptedTo,
    overs,
    setOvers,
  } = useInitialMatchSetup();

  const [error, setError] = useState("");

  const handleStartMatch = () => {
    if (!teamA.trim()) {
      setError("Please enter Team A name");
      return;
    }
    if (teamA.trim().length < 3) {
      setError("Team A name must be at least 3 characters");
      return;
    }
    if (!teamB.trim()) {
      setError("Please enter Team B name");
      return;
    }
    if (teamB.trim().length < 3) {
      setError("Team B name must be at least 3 characters");
      return;
    }
    if (teamA.trim().toLowerCase() === teamB.trim().toLowerCase()) {
      setError("Team names cannot be the same");
      return;
    }
    if (!overs.trim()) {
      setError("Please enter total overs");
      return;
    }
    if (isNaN(Number(overs))) {
      setError("Overs must be a valid number");
      return;
    }
    if (Number(overs) <= 0) {
      setError("Overs must be greater than 0");
      return;
    }
    if (Number(overs) > 50) {
      setError("Overs cannot be greater than 50");
      return;
    }
    setError("");
    router.push({
      pathname: "/opening-players",
    });
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
          <View className="mb-5">
            <Text className="text-4xl font-extrabold tracking-tight text-text-primary">
              Create Match
            </Text>
            <View className="mt-2 h-1 w-16 rounded-full bg-primary" />
          </View>

          {/* TEAM NAMES */}
          <View className="mb-5 rounded-2xl border border-border-light bg-surface p-5 shadow-card">
            <Text className="mb-3 text-lg font-bold text-text-primary">
              Teams
            </Text>

            <TextInput
              value={teamA}
              onChangeText={(text) => {
                setError("");
                setTeamA(text);
              }}
              placeholder="Team A"
              placeholderTextColor={Colors.placeholder}
              className="mb-3 rounded-xl border border-border-light bg-background px-4 py-3 text-base text-text-primary"
              style={{ fontSize: 16 }}
              cursorColor={Colors.primary.DEFAULT}
              selectionColor={Colors.primary.DEFAULT}
            />

            <TextInput
              value={teamB}
              onChangeText={(text) => {
                setError("");
                setTeamB(text);
              }}
              placeholder="Team B"
              placeholderTextColor={Colors.placeholder}
              className="rounded-xl border border-border-light bg-background px-4 py-3 text-base text-text-primary"
              style={{ fontSize: 16 }}
              cursorColor={Colors.primary.DEFAULT}
              selectionColor={Colors.primary.DEFAULT}
            />
          </View>

          {/* TOSS WINNER */}
          <View className="mb-5 rounded-2xl border border-border-light bg-surface p-5 shadow-card">
            <Text className="mb-3 text-lg font-bold text-text-primary">
              Toss Winner
            </Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setTossWonBy("teamA")}
                className={`flex-1 items-center rounded-xl border py-3 transition-all ${
                  tossWonBy === "teamA"
                    ? "border-primary bg-primary/10"
                    : "border-border-light bg-background"
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text
                  className={`text-base font-bold ${
                    tossWonBy === "teamA" ? "text-primary" : "text-text-primary"
                  }`}
                >
                  {teamA || "Team A"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTossWonBy("teamB")}
                className={`flex-1 items-center rounded-xl border py-3 transition-all ${
                  tossWonBy === "teamB"
                    ? "border-primary bg-primary/10"
                    : "border-border-light bg-background"
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text
                  className={`text-base font-bold ${
                    tossWonBy === "teamB" ? "text-primary" : "text-text-primary"
                  }`}
                >
                  {teamB || "Team B"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* DECISION */}
          <View className="mb-5 rounded-2xl border border-border-light bg-surface p-5 shadow-card">
            <Text className="mb-3 text-lg font-bold text-text-primary">
              Decision
            </Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setOptedTo("bat")}
                className={`flex-1 items-center rounded-xl border py-3 transition-all ${
                  optedTo === "bat"
                    ? "border-primary bg-primary/10"
                    : "border-border-light bg-background"
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text
                  className={`text-base font-bold ${
                    optedTo === "bat" ? "text-primary" : "text-text-primary"
                  }`}
                >
                  Bat
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setOptedTo("bowl")}
                className={`flex-1 items-center rounded-xl border py-3 transition-all ${
                  optedTo === "bowl"
                    ? "border-primary bg-primary/10"
                    : "border-border-light bg-background"
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text
                  className={`text-base font-bold ${
                    optedTo === "bowl" ? "text-primary" : "text-text-primary"
                  }`}
                >
                  Bowl
                </Text>
              </Pressable>
            </View>
          </View>

          {/* TOTAL OVERS */}
          <View className="mb-6 rounded-2xl border border-border-light bg-surface p-5 shadow-card">
            <Text className="mb-3 text-lg font-bold text-text-primary">
              Total Overs
            </Text>

            <TextInput
              value={overs}
              onChangeText={(text) => {
                setError("");
                setOvers(text);
              }}
              placeholder="20"
              placeholderTextColor={Colors.placeholder}
              keyboardType="numeric"
              returnKeyType="done"
              className="rounded-xl border border-border-light bg-background px-4 py-3 text-base text-text-primary"
              style={{ fontSize: 16 }}
              cursorColor={Colors.primary.DEFAULT}
              selectionColor={Colors.primary.DEFAULT}
            />
          </View>

          {/* ERROR */}
          {error ? (
            <View className="mb-5 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3">
              <Text className="text-sm font-semibold text-danger">{error}</Text>
            </View>
          ) : null}

          {/* ACTIONS */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push("/advanced-settings")}
              className="flex-1 items-center rounded-xl border border-border-light bg-surface py-4 active:bg-background"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Text className="text-base font-bold text-text-primary">
                Settings
              </Text>
            </Pressable>

            <Pressable
              onPress={handleStartMatch}
              className="flex-1 items-center rounded-xl bg-primary py-4 shadow-card"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Text className="text-base font-bold text-text-inverse">
                Start Match
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
