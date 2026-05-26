import { Colors } from "@/constants/colors";
import { useScoringStore } from "@/stores/useScoringStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

const NewBowlerScreen = () => {
  const router = useRouter();

  const innings1 = useScoringStore((s) => s.innings1);
  const innings2 = useScoringStore((s) => s.innings2);
  const currentInnings = useScoringStore((s) => s.currentInnings);
  const players = useScoringStore((s) => s.players);
  const teamA = useScoringStore((s) => s.teamA);
  const teamB = useScoringStore((s) => s.teamB);
  const matchRules = useScoringStore((s) => s.matchRules);
  const startNewOverWithBowler = useScoringStore(
    (s) => s.startNewOverWithBowler,
  );
  const clearOverCompleted = useScoringStore((s) => s.clearOverCompleted);
  const setBowler = useScoringStore((s) => s.setBowler);

  const innings = currentInnings === 1 ? innings1 : innings2;
  const bowlingTeamKey = innings.bowlingTeam!;
  const bowlingTeam = bowlingTeamKey === "teamA" ? teamA : teamB;
  const currentBowlerId = innings.currentBowlerId!;
  const previousBowlers = bowlingTeam.playersIds.filter(
    (id) => id !== currentBowlerId,
  );

  const maxPlayers = parseInt(matchRules.playersPerTeam, 10) || 11;
  const canAddNew = bowlingTeam.playersIds.length < maxPlayers;

  const [newBowlerName, setNewBowlerName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setNewBowlerName("");
    setError("");
  }, [previousBowlers.length, bowlingTeam.playersIds.length]);

  const handleSelectPrevious = (playerId: string) => {
    Keyboard.dismiss();
    clearOverCompleted();
    setBowler(playerId);
    router.back();
  };

  const handleAddNew = () => {
    const trimmed = newBowlerName.trim();
    if (!trimmed) {
      setError("Please enter a bowler name");
      return;
    }
    if (trimmed.length < 3) {
      setError("Name should be at least 3 characters");
      return;
    }
    Keyboard.dismiss();
    clearOverCompleted();
    startNewOverWithBowler(trimmed);
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
            New Bowler
          </Text>
          <View className="w-10" />
        </View>

        <FlatList
          data={previousBowlers}
          keyboardShouldPersistTaps="always"
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListHeaderComponent={
            previousBowlers.length > 0 ? (
              <View className="mb-4">
                <Text className="mb-3 text-lg font-bold text-text-primary">
                  Previous Bowlers
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const player = players[item];
            return (
              <Pressable
                onPress={() => handleSelectPrevious(item)}
                className="mb-3 rounded-2xl border border-border-light bg-surface px-4 py-4"
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-bold text-text-primary">
                    {player?.name ?? "Unknown"}
                  </Text>
                  <Text className="text-lg text-text-secondary">›</Text>
                </View>
              </Pressable>
            );
          }}
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

                {/* NEW BOWLER */}
                <View className="rounded-2xl border border-border-light bg-surface p-5">
                  <Text className="mb-3 text-lg font-bold text-text-primary">
                    New Bowler Name
                  </Text>
                  <TextInput
                    value={newBowlerName}
                    onChangeText={(text) => {
                      setError("");
                      setNewBowlerName(text);
                    }}
                    placeholder="Enter bowler name"
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
                      Add & Start Over
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View className="rounded-2xl border border-border-light bg-surface p-5">
                <Text className="text-center text-base text-text-secondary">
                  Maximum bowlers reached ({maxPlayers} players).
                  {"\n"}
                  Please select a previous bowler.
                </Text>
              </View>
            )
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewBowlerScreen;
