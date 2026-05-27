import { Colors } from "@/constants/colors";
import { useScoringStore } from "@/stores/useScoringStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WICKET_TYPES = [
  "bowled",
  "caught",
  "run out (striker)",
  "run out (non-striker)",
  "stumping",
  "lbw",
  "hit wicket",
] as const;

type WicketType = (typeof WICKET_TYPES)[number];

const REQUIRES_FIELDER: WicketType[] = [
  "caught",
  "stumping",
  "run out (striker)",
  "run out (non-striker)",
];

const WicketScreen = () => {
  const router = useRouter();

  const innings1 = useScoringStore((s) => s.innings1);
  const innings2 = useScoringStore((s) => s.innings2);
  const currentInnings = useScoringStore((s) => s.currentInnings);
  const players = useScoringStore((s) => s.players);
  const teamA = useScoringStore((s) => s.teamA);
  const teamB = useScoringStore((s) => s.teamB);
  const addBall = useScoringStore((s) => s.addBall);
  const addPlayerToTeam = useScoringStore((s) => s.addPlayerToTeam);

  const [error, setError] = useState("");

  const innings = currentInnings === 1 ? innings1 : innings2;
  const battingTeamKey = innings.battingTeam!;
  const battingTeam = battingTeamKey === "teamA" ? teamA : teamB;
  const fieldingTeamKey = battingTeamKey === "teamA" ? "teamB" : "teamA";
  const fieldingTeam = fieldingTeamKey === "teamA" ? teamA : teamB;

  const strikerId = innings.strikerId!;
  const nonStrikerId = innings.nonStrikerId!;
  const currentBowlerId = innings.currentBowlerId!;
  const currentBowlerName = players[currentBowlerId]?.name ?? "Bowler";

  const [runs, setRuns] = useState(0);
  const [wicketType, setWicketType] = useState<WicketType>("bowled");
  const [didCross, setDidCross] = useState(false);
  const [newBatsmanId, setNewBatsmanId] = useState<string>("");
  const [newBatsmanName, setNewBatsmanName] = useState("");
  const [fielderId, setFielderId] = useState<string>("");
  const [fielderName, setFielderName] = useState("");
  const [newFielderName, setNewFielderName] = useState("");

  const outIsStriker = !wicketType.includes("non-striker");
  const outPlayerId = outIsStriker ? strikerId : nonStrikerId;
  const outPlayerName = players[outPlayerId]?.name ?? "Unknown";

  const otherBatsmanId = outIsStriker ? nonStrikerId : strikerId;
  const availableBatsmen = useMemo(() => {
    return battingTeam.playersIds.filter((id) => {
      if (id === outPlayerId) return false;
      if (id === otherBatsmanId) return false;
      const p = players[id];
      if (!p) return false;
      if (p.stats.batting.isOut) return false;
      return true;
    });
  }, [battingTeam.playersIds, players, outPlayerId, otherBatsmanId]);

  const availableFielders = useMemo(() => {
    const fielders = fieldingTeam.playersIds.map((id) => ({
      id,
      name: players[id]?.name ?? "Unknown",
    }));
    const hasBowler = fielders.some((f) => f.id === currentBowlerId);
    if (!hasBowler && currentBowlerId) {
      fielders.push({ id: currentBowlerId, name: currentBowlerName });
    }
    return fielders;
  }, [fieldingTeam.playersIds, players, currentBowlerId, currentBowlerName]);

  const matchRules = useScoringStore((s) => s.matchRules);
  const maxWickets = parseInt(matchRules.playersPerTeam, 10) - 1;
  const isAllOut = innings.wickets + 1 > maxWickets;

  const requiresFielder = REQUIRES_FIELDER.includes(wicketType);

  const handleSubmit = () => {
    let finalFielderId = fielderId;
    let finalFielderName = fielderName;

    if (
      requiresFielder &&
      !finalFielderId &&
      newFielderName.trim().length >= 3
    ) {
      const createdId = addPlayerToTeam(fieldingTeamKey, newFielderName.trim());
      finalFielderId = createdId;
      finalFielderName = newFielderName.trim();
    }

    if (requiresFielder && !finalFielderId) {
      setError("Please select or enter a valid fielder");
      return;
    }

    let finalNewBatsmanId = newBatsmanId;
    let finalNewBatsmanName = newBatsmanName;
    if (!isAllOut) {
      if (!newBatsmanId && newBatsmanName.trim().length >= 3) {
        const createdId = addPlayerToTeam(
          battingTeamKey,
          newBatsmanName.trim(),
        );
        finalNewBatsmanId = createdId;
        finalNewBatsmanName = newBatsmanName.trim();
      }
      if (!finalNewBatsmanId) {
        setError("Please select or enter a valid batsman");
        return;
      }
    }

    const ballString = runs > 0 ? `${runs}W` : "W";
    const options: any = {
      wicketType: wicketType.includes("run out") ? "run out" : wicketType,
    };

    if (wicketType.includes("run out")) {
      options.didBattersCross = didCross;
      options.outType = outIsStriker ? "striker" : "nonStriker";
    }

    if (requiresFielder) {
      options.fielderId = finalFielderId;
      options.fielderName = finalFielderName;
    }

    if (!isAllOut) {
      options.newBatsmanId = finalNewBatsmanId;
      options.newBatsmanName =
        finalNewBatsmanName || players[finalNewBatsmanId]?.name || "Unknown";
    }

    addBall(ballString, options);
    router.back();
  };

  // Deselect fielder
  const deselectFielder = () => {
    setFielderId("");
    setFielderName("");
    // Don't clear newFielderName – the input will appear again, preserving any typed text.
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* HEADER */}
        <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
          <Pressable
            onPress={() => router.back()}
            className="size-12 items-center justify-center rounded-full"
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
          </Pressable>
          <Text className="text-xl font-black text-text-primary">Wicket</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }} // ✅ added bottom padding
        >
          {/* Out Player Card */}
          <View className="mb-4 rounded-3xl border border-border-light bg-surface px-4 py-4">
            <View>
              <Text className="text-xs uppercase tracking-[1px] text-text-secondary">
                Dismissed
              </Text>
              <Text className="mt-1 text-xl font-black text-text-primary">
                {outPlayerName}
              </Text>
              <Text className="mt-1 text-sm capitalize text-danger">
                {wicketType}
              </Text>
            </View>
          </View>

          {/* Runs */}
          <View className="mb-4">
            <Text className="mb-3 text-sm font-bold uppercase tracking-[1px] text-text-secondary">
              Runs Before Wicket
            </Text>
            <View className="flex-row justify-between">
              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                <Pressable
                  key={num}
                  onPress={() => setRuns(num)}
                  className={`h-11 w-11 items-center justify-center rounded-2xl ${
                    runs === num
                      ? "bg-primary"
                      : "border border-border-light bg-surface"
                  }`}
                >
                  <Text
                    className={`text-base font-black ${runs === num ? "text-text-inverse" : "text-text-primary"}`}
                  >
                    {num}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Wicket Types */}
          <View className="mb-4">
            <Text className="mb-3 text-sm font-bold uppercase tracking-[1px] text-text-secondary">
              Wicket Type
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={WICKET_TYPES}
              keyExtractor={(item) => item}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => {
                const active = wicketType === item;
                return (
                  <Pressable
                    onPress={() => {
                      setWicketType(item);
                      setFielderId("");
                      setFielderName("");
                      setNewFielderName("");
                      setError("");
                    }}
                    className={`rounded-2xl px-4 py-3 ${
                      active
                        ? "bg-primary"
                        : "border border-border-light bg-surface"
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold capitalize ${active ? "text-text-inverse" : "text-text-primary"}`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>

          {/* Fielder Selection (if required) */}
          {requiresFielder && (
            <View className="mb-4 rounded-2xl border border-border-light bg-surface p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-bold uppercase tracking-[1px] text-text-secondary">
                  Fielder
                </Text>
                {fielderId ? (
                  <Pressable
                    onPress={deselectFielder}
                    className="px-3 py-1 rounded-full bg-danger/10"
                  >
                    <Text className="text-xs font-bold text-danger">
                      Deselect
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={availableFielders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item }) => {
                  const active = fielderId === item.id;
                  const isBowler = item.id === currentBowlerId;
                  return (
                    <Pressable
                      onPress={() => {
                        setFielderId(item.id);
                        setFielderName(item.name);
                        setNewFielderName(""); // clear new name input
                        setError("");
                      }}
                      className={`rounded-2xl px-4 py-3 ${
                        active
                          ? "bg-primary"
                          : "border border-border-light bg-background"
                      }`}
                    >
                      <Text
                        className={`font-bold ${active ? "text-text-inverse" : "text-text-primary"}`}
                      >
                        {isBowler ? `${item.name} (bowler)` : item.name}
                      </Text>
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  <Text className="text-text-tertiary">
                    No fielders available
                  </Text>
                }
              />

              {/* ✅ Show text input only when no fielder is selected */}
              {!fielderId && (
                <TextInput
                  value={newFielderName}
                  onChangeText={(text) => {
                    setNewFielderName(text);
                    if (text) {
                      setFielderId("");
                      setFielderName("");
                    }
                    setError("");
                  }}
                  placeholder="Or enter new fielder name"
                  placeholderTextColor={Colors.placeholder}
                  className="mt-4 rounded-2xl border border-border-light bg-background px-4 py-3 text-text-primary"
                />
              )}
            </View>
          )}

          {/* Run out crossing option */}
          {wicketType.includes("run out") && (
            <View className="mb-4 rounded-2xl border border-border-light bg-surface px-4 py-4">
              <Text className="mb-3 text-sm font-bold text-text-primary">
                Did batters cross?
              </Text>
              <View className="flex-row gap-3">
                {["Yes", "No"].map((item) => {
                  const active =
                    (item === "Yes" && didCross) ||
                    (item === "No" && !didCross);
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setDidCross(item === "Yes")}
                      className={`flex-1 rounded-xl py-3 ${
                        active
                          ? "bg-primary"
                          : "border border-border-light bg-background"
                      }`}
                    >
                      <Text
                        className={`text-center font-bold ${active ? "text-text-inverse" : "text-text-primary"}`}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* New Batter */}
          {!isAllOut ? (
            <View className="rounded-3xl border border-border-light bg-surface p-4">
              <Text className="mb-3 text-sm font-bold uppercase tracking-[1px] text-text-secondary">
                New Batter
              </Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={availableBatsmen}
                keyExtractor={(id) => id}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item: id }) => {
                  const player = players[id];
                  const active = newBatsmanId === id;
                  return (
                    <Pressable
                      onPress={() => {
                        setNewBatsmanId(id);
                        setNewBatsmanName(player?.name ?? "");
                        Keyboard.dismiss();
                        setError("");
                      }}
                      className={`rounded-2xl px-4 py-3 ${
                        active
                          ? "bg-primary"
                          : "border border-border-light bg-background"
                      }`}
                    >
                      <Text
                        className={`font-bold ${active ? "text-text-inverse" : "text-text-primary"}`}
                      >
                        {player?.name}
                      </Text>
                    </Pressable>
                  );
                }}
              />
              <TextInput
                value={newBatsmanName}
                onChangeText={(text) => {
                  setNewBatsmanName(text);
                  if (text) setNewBatsmanId("");
                  setError("");
                }}
                placeholder="Enter new batsman"
                placeholderTextColor={Colors.placeholder}
                className="mt-4 rounded-2xl border border-border-light bg-background px-4 py-3 text-text-primary"
              />
            </View>
          ) : (
            <View className="rounded-3xl border border-danger/20 bg-danger/10 p-5">
              <Text className="text-center text-base font-black text-danger">
                ALL OUT
              </Text>
              <Text className="mt-1 text-center text-sm text-text-secondary">
                Innings will end after this dismissal
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Error message */}
        {error && (
          <View className="mb-4 flex-row items-center gap-3 rounded-3xl border border-danger/20 bg-danger/10 px-4 py-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-danger/15">
              <Text className="text-lg font-black text-danger">!</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-black text-danger">
                Invalid Input
              </Text>
              <Text className="mt-1 text-sm text-text-secondary">{error}</Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <View className="border-t border-border-light bg-background px-4 py-4">
          <Pressable
            onPress={handleSubmit}
            className="items-center rounded-2xl bg-danger py-4"
          >
            <Text className="text-base font-black text-white">
              Record Wicket
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WicketScreen;
