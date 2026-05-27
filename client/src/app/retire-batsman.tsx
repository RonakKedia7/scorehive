import { Colors } from "@/constants/colors";
import { useScoringStore } from "@/stores/useScoringStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  FlatList,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import uuid from "react-native-uuid";

const RetireBatsmanScreen = () => {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: "hurt" | "out" }>();

  const innings1 = useScoringStore((s) => s.innings1);
  const innings2 = useScoringStore((s) => s.innings2);
  const currentInnings = useScoringStore((s) => s.currentInnings);
  const players = useScoringStore((s) => s.players);
  const teamA = useScoringStore((s) => s.teamA);
  const teamB = useScoringStore((s) => s.teamB);
  const matchRules = useScoringStore((s) => s.matchRules);
  const retireBatsman = useScoringStore((s) => s.retireBatsman);

  const innings = currentInnings === 1 ? innings1 : innings2;
  const battingTeamKey = innings.battingTeam!;
  const battingTeam = battingTeamKey === "teamA" ? teamA : teamB;

  const currentStrikerId = innings.strikerId;
  const currentNonStrikerId = innings.nonStrikerId;
  const currentStriker = currentStrikerId ? players[currentStrikerId] : null;

  // List of players who can bat next: not out, not currently batting, and belong to batting team
  const availableBatsmen = battingTeam.playersIds
    .map((id) => players[id])
    .filter((p) => {
      if (!p) return false;
      // Exclude current striker and non-striker
      if (p.id === currentStrikerId || p.id === currentNonStrikerId)
        return false;
      // Exclude those already out (dismissal exists)
      if (p.stats.batting.isOut) return false;
      return true;
    });

  const maxPlayers = parseInt(matchRules.playersPerTeam, 10) || 11;
  const canAddNew = battingTeam.playersIds.length < maxPlayers;

  const [newBatsmanName, setNewBatsmanName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setNewBatsmanName("");
    setError("");
  }, [availableBatsmen.length]);

  const handleSelectExisting = (playerId: string) => {
    Keyboard.dismiss();
    retireBatsman(type, playerId, players[playerId]?.name);
    router.back();
  };

  const handleAddNew = () => {
    const trimmed = newBatsmanName.trim();
    if (!trimmed) {
      setError("Please enter a batsman name");
      return;
    }
    if (trimmed.length < 3) {
      setError("Name should be at least 3 characters");
      return;
    }
    Keyboard.dismiss();
    const id = uuid.v4().toString();
    retireBatsman(type, id, trimmed);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="rounded-xl p-2"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <Text className="text-2xl font-extrabold text-text-primary">
            Retire {type === "hurt" ? "Hurt" : "Out"}
          </Text>
          <View className="w-10" />
        </View>

        {/* Retiring Batsman Info */}
        <View className="mx-4 mb-6 rounded-2xl bg-surface p-5 border border-border-light">
          <Text className="text-sm font-medium text-text-tertiary mb-1">
            Retiring Batsman
          </Text>
          <Text className="text-2xl font-black text-text-primary">
            {currentStriker?.name ?? "Unknown"}
          </Text>
        </View>

        <FlatList
          data={availableBatsmen}
          keyboardShouldPersistTaps="always"
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListHeaderComponent={
            availableBatsmen.length > 0 ? (
              <View className="mb-4">
                <Text className="mb-3 text-lg font-bold text-text-primary">
                  Select New Batsman
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectExisting(item.id)}
              className="mb-3 rounded-2xl border border-border-light bg-surface px-4 py-4"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-text-primary">
                  {item.name}
                </Text>
                <Text className="text-lg text-text-secondary">›</Text>
              </View>
            </Pressable>
          )}
          ListFooterComponent={
            canAddNew ? (
              <>
                {/* DIVIDER */}
                <View className="my-6 flex-row items-center">
                  <View className="h-[1px] flex-1 bg-border-light" />
                  <Text className="mx-3 text-xs font-bold uppercase tracking-[2px] text-text-secondary">
                    Add New
                  </Text>
                  <View className="h-[1px] flex-1 bg-border-light" />
                </View>

                {/* NEW BATSMAN */}
                <View className="rounded-2xl border border-border-light bg-surface p-5">
                  <Text className="mb-3 text-lg font-bold text-text-primary">
                    New Batsman Name
                  </Text>
                  <TextInput
                    value={newBatsmanName}
                    onChangeText={(text) => {
                      setError("");
                      setNewBatsmanName(text);
                    }}
                    placeholder="Enter batsman name"
                    placeholderTextColor={Colors.placeholder}
                    className="rounded-xl border border-border-light bg-background px-4 py-4 text-base text-text-primary"
                    cursorColor={Colors.primary.DEFAULT}
                    selectionColor={Colors.primary.DEFAULT}
                    returnKeyType="done"
                    onSubmitEditing={handleAddNew}
                  />
                  {error ? (
                    <View className="mt-4 rounded-xl bg-danger/10 px-4 py-3">
                      <Text className="text-sm font-semibold text-danger">
                        {error}
                      </Text>
                    </View>
                  ) : null}
                  <Pressable
                    onPress={handleAddNew}
                    className="mt-5 items-center rounded-xl bg-primary py-4"
                    style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                  >
                    <Text className="text-base font-bold text-text-inverse">
                      Add & Retire
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View className="rounded-2xl border border-border-light bg-surface p-5">
                <Text className="text-center text-base text-text-secondary">
                  Maximum batsmen reached ({maxPlayers} players).
                  {"\n"}
                  Please select an existing player.
                </Text>
              </View>
            )
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RetireBatsmanScreen;
