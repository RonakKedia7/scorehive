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

const WicketScreen = () => {
  const router = useRouter();

  const innings1 = useScoringStore((s) => s.innings1);
  const innings2 = useScoringStore((s) => s.innings2);
  const currentInnings = useScoringStore((s) => s.currentInnings);
  const players = useScoringStore((s) => s.players);
  const teamA = useScoringStore((s) => s.teamA);
  const teamB = useScoringStore((s) => s.teamB);
  const addBall = useScoringStore((s) => s.addBall);

  const [error, setError] = useState("");

  const innings = currentInnings === 1 ? innings1 : innings2;
  const battingTeamKey = innings.battingTeam!;
  const battingTeam = battingTeamKey === "teamA" ? teamA : teamB;

  const strikerId = innings.strikerId!;
  const nonStrikerId = innings.nonStrikerId!;

  const [runs, setRuns] = useState(0);
  const [wicketType, setWicketType] = useState<WicketType>("bowled");
  const [didCross, setDidCross] = useState(false);
  const [newBatsmanId, setNewBatsmanId] = useState<string>("");
  const [newBatsmanName, setNewBatsmanName] = useState("");

  // Determine which player is out based on wicket type
  const outIsStriker = !wicketType.includes("non-striker");
  const outPlayerId = outIsStriker ? strikerId : nonStrikerId;
  const outPlayerName = players[outPlayerId]?.name ?? "Unknown";

  const { addPlayerToBattingTeam } = useScoringStore();

  const otherBatsmanId = outIsStriker ? nonStrikerId : strikerId;
  const availableBatsmen = useMemo(() => {
    return battingTeam.playersIds.filter((id) => {
      // Exclude the dismissed player
      if (id === outPlayerId) return false;
      // Exclude the other batsman who stays on field
      if (id === otherBatsmanId) return false;
      const p = players[id];
      if (!p) return false;
      // Exclude anyone already out
      if (p.stats.batting.isOut) return false;
      return true;
    });
  }, [battingTeam.playersIds, players, outPlayerId, otherBatsmanId]);

  // Check if all out (no available batsmen)
  const matchRules = useScoringStore((s) => s.matchRules);
  const maxWickets = parseInt(matchRules.playersPerTeam, 10) - 1;
  const isAllOut = innings.wickets + 1 > maxWickets; // +1 because this wicket will be recorded

  const handleSubmit = () => {
    let finalNewBatsmanId = newBatsmanId;
    let finalNewBatsmanName = newBatsmanName;
    if (!isAllOut) {
      // If user typed a name but didn't select an existing player, we must create one
      if (!newBatsmanId && newBatsmanName.trim().length >= 3) {
        const createdId = addPlayerToBattingTeam(newBatsmanName.trim());
        setNewBatsmanId(createdId); // update state (optional but cleaner)
        finalNewBatsmanId = createdId;
        finalNewBatsmanName = newBatsmanName.trim();
      }
      // If still no ID, error
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

    if (!isAllOut) {
      options.newBatsmanId = finalNewBatsmanId; // ← use the final ID
      options.newBatsmanName =
        finalNewBatsmanName || players[finalNewBatsmanId]?.name || "Unknown";
    }

    addBall(ballString, options);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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

        <View className="flex-1 px-4">
          {/* OUT PLAYER CARD */}
          <View className="mb-4 rounded-3xl border border-border-light bg-surface px-4 py-4">
            <View className="flex-row items-center justify-between">
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
          </View>

          {/* RUNS */}
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
                    className={`text-base font-black ${
                      runs === num ? "text-text-inverse" : "text-text-primary"
                    }`}
                  >
                    {num}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* WICKET TYPES */}
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
                    onPress={() => setWicketType(item)}
                    className={`rounded-2xl px-4 py-3 ${
                      active
                        ? "bg-primary"
                        : "border border-border-light bg-surface"
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold capitalize ${
                        active ? "text-text-inverse" : "text-text-primary"
                      }`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>

          {/* RUN OUT OPTIONS */}
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
                        className={`text-center font-bold ${
                          active ? "text-text-inverse" : "text-text-primary"
                        }`}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* NEW BATSMAN */}
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
                      }}
                      className={`rounded-2xl px-4 py-3 ${
                        active
                          ? "bg-primary"
                          : "border border-border-light bg-background"
                      }`}
                    >
                      <Text
                        className={`font-bold ${
                          active ? "text-text-inverse" : "text-text-primary"
                        }`}
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
                placeholder={"Enter new batsman"}
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

              <Text className="mt-1 text-sm text-text-secondary">{error}</Text>
            </View>
          </View>
        ) : null}

        {/* BOTTOM CTA */}
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
