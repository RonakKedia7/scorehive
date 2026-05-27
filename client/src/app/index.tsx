import { Colors } from "@/constants/colors";
import { useInitialMatchSetup } from "@/stores/useInitialMatchSetup";
import { useRouter } from "expo-router";
import { memo, useCallback, useState } from "react";
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

type SelectButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const SelectButton = memo(({ label, selected, onPress }: SelectButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#ffffff10" }}
      className={`flex-1 items-center rounded-2xl border py-3 ${
        selected
          ? "border-primary bg-primary/15"
          : "border-border-light bg-background"
      }`}
    >
      <Text
        className={`text-base font-bold ${
          selected ? "text-primary" : "text-text-primary"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
});

SelectButton.displayName = "SelectButton";

export default function HomeScreen() {
  const router = useRouter();

  // SINGLE STORE ACCESS (better performance)
  const store = useInitialMatchSetup();

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
  } = store;

  const [error, setError] = useState("");

  const handleTeamA = useCallback(
    (text: string) => {
      setError("");
      setTeamA(text);
    },
    [setTeamA],
  );

  const handleTeamB = useCallback(
    (text: string) => {
      setError("");
      setTeamB(text);
    },
    [setTeamB],
  );

  const handleOvers = useCallback(
    (text: string) => {
      setError("");
      setOvers(text);
    },
    [setOvers],
  );

  const selectTeamA = useCallback(() => {
    setTossWonBy("teamA");
  }, [setTossWonBy]);

  const selectTeamB = useCallback(() => {
    setTossWonBy("teamB");
  }, [setTossWonBy]);

  const selectBat = useCallback(() => {
    setOptedTo("bat");
  }, [setOptedTo]);

  const selectBowl = useCallback(() => {
    setOptedTo("bowl");
  }, [setOptedTo]);

  const openSettings = useCallback(() => {
    router.push("/advanced-settings");
  }, [router]);

  const handleStartMatch = useCallback(() => {
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
  }, [overs, router, teamA, teamB]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 120,
          }}
        >
          {/* HEADER */}
          <View className="mb-6">
            <Text className="text-4xl font-black tracking-tight text-text-primary">
              Create Match
            </Text>

            <View className="mt-3 flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-primary" />
              <View className="h-[2px] flex-1 rounded-full bg-primary/30" />
            </View>
          </View>

          {/* TEAMS */}
          <View className="mb-4 rounded-3xl border border-border-light bg-surface px-4 py-4">
            <Text className="mb-4 text-lg font-black text-text-primary">
              Teams
            </Text>

            <TextInput
              value={teamA}
              onChangeText={handleTeamA}
              placeholder="Team A"
              placeholderTextColor={Colors.placeholder}
              className="mb-3 rounded-2xl border border-border-light bg-background px-4 py-3 text-base text-text-primary"
              cursorColor={Colors.primary.DEFAULT}
              selectionColor={Colors.primary.DEFAULT}
              style={{ fontSize: 16 }}
            />

            <TextInput
              value={teamB}
              onChangeText={handleTeamB}
              placeholder="Team B"
              placeholderTextColor={Colors.placeholder}
              className="rounded-2xl border border-border-light bg-background px-4 py-3 text-base text-text-primary"
              cursorColor={Colors.primary.DEFAULT}
              selectionColor={Colors.primary.DEFAULT}
              style={{ fontSize: 16 }}
            />
          </View>

          {/* TOSS */}
          <View className="mb-4 rounded-3xl border border-border-light bg-surface px-4 py-4">
            <Text className="mb-4 text-lg font-black text-text-primary">
              Toss Winner
            </Text>

            <View className="flex-row gap-3">
              <SelectButton
                label={teamA || "Team A"}
                selected={tossWonBy === "teamA"}
                onPress={selectTeamA}
              />

              <SelectButton
                label={teamB || "Team B"}
                selected={tossWonBy === "teamB"}
                onPress={selectTeamB}
              />
            </View>
          </View>

          {/* DECISION */}
          <View className="mb-4 rounded-3xl border border-border-light bg-surface px-4 py-4">
            <Text className="mb-4 text-lg font-black text-text-primary">
              Decision
            </Text>

            <View className="flex-row gap-3">
              <SelectButton
                label="Bat"
                selected={optedTo === "bat"}
                onPress={selectBat}
              />

              <SelectButton
                label="Bowl"
                selected={optedTo === "bowl"}
                onPress={selectBowl}
              />
            </View>
          </View>

          {/* OVERS */}
          <View className="mb-4 rounded-3xl border border-border-light bg-surface px-4 py-4">
            <Text className="mb-4 text-lg font-black text-text-primary">
              Total Overs
            </Text>

            <TextInput
              value={overs}
              onChangeText={handleOvers}
              placeholder="20"
              placeholderTextColor={Colors.placeholder}
              keyboardType="numeric"
              returnKeyType="done"
              className="rounded-2xl border border-border-light bg-background px-4 py-3 text-base text-text-primary"
              cursorColor={Colors.primary.DEFAULT}
              selectionColor={Colors.primary.DEFAULT}
              style={{ fontSize: 16 }}
            />
          </View>

          {/* ERROR */}
          {error ? (
            <View className="mb-4 flex-row items-center gap-3 rounded-3xl border border-danger/20 bg-danger/10 px-4 py-4">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-danger/15">
                <Text className="text-lg font-black text-danger">!</Text>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-black text-danger">
                  Invalid Match Setup
                </Text>

                <Text className="mt-1 text-sm text-text-secondary">
                  {error}
                </Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* BOTTOM ACTIONS */}
        <View className="border-t border-border-light bg-background px-4 py-4">
          <View className="flex-row gap-3">
            <Pressable
              onPress={openSettings}
              android_ripple={{ color: "#ffffff10" }}
              className="flex-1 items-center rounded-2xl border border-border-light bg-surface py-4"
            >
              <Text className="text-base font-black text-text-primary">
                Settings
              </Text>
            </Pressable>

            <Pressable
              onPress={handleStartMatch}
              android_ripple={{ color: "#ffffff20" }}
              className="flex-1 items-center rounded-2xl bg-primary py-4"
            >
              <Text className="text-base font-black text-text-inverse">
                Start Match
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
