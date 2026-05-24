import { View, Text, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { useState } from "react";
import { useStartMatch } from "@/hooks/useStartMatch";

const OpeningPlayersScreen = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [striker, setStriker] = useState("");
  const [nonStriker, setNonStriker] = useState("");
  const [openingBowler, setOpeningBowler] = useState("");
  const { startMatch } = useStartMatch();

  const handleStartMatch = () => {
    if (!striker.trim()) {
      setError("Enter striker name");
      return;
    }
    if (striker.trim().length < 3) {
      setError("Striker name must be at least 3 characters");
      return;
    }
    if (!nonStriker.trim()) {
      setError("Enter non-striker name");
      return;
    }
    if (nonStriker.trim().length < 3) {
      setError("Non-striker name must be at least 3 characters");
      return;
    }
    if (striker.trim().toLowerCase() === nonStriker.trim().toLowerCase()) {
      setError("Striker and non-striker cannot be same");
      return;
    }
    if (!openingBowler.trim()) {
      setError("Enter opening bowler name");
      return;
    }
    if (openingBowler.trim().length < 3) {
      setError("Opening bowler name must be at least 3 characters");
      return;
    }

    setError("");

    startMatch({
      strikerName: striker.trim(),
      nonStrikerName: nonStriker.trim(),
      openingBowlerName: openingBowler.trim(),
    });

    // router.push({ pathname: "/scoring" });
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      {/* HEADER */}
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="rounded-xl bg-card p-3 active:bg-background"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </Pressable>

        <Text className="text-2xl font-extrabold tracking-tight text-textPrimary">
          Select Opening Players
        </Text>

        <View className="w-[60px]" />
      </View>

      {/* INPUTS */}
      <View className="mb-4 rounded-2xl border border-border-light bg-card p-5 shadow-card">
        <Text className="mb-3 text-lg font-bold text-textPrimary">Striker</Text>

        <TextInput
          value={striker}
          onChangeText={(text) => {
            setError("");
            setStriker(text);
          }}
          placeholder="Player name"
          placeholderTextColor={Colors.placeholder}
          className="rounded-xl border border-border-light bg-background px-4 py-3 text-base text-textPrimary"
          style={{ fontSize: 16 }}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          cursorColor={Colors.primary.DEFAULT}
          selectionColor={Colors.primary.DEFAULT}
        />
      </View>
      <View className="mb-4 rounded-2xl border border-border-light bg-card p-5 shadow-card">
        <Text className="mb-3 text-lg font-bold text-textPrimary">
          Non-striker
        </Text>

        <TextInput
          value={nonStriker}
          onChangeText={(text) => {
            setError("");
            setNonStriker(text);
          }}
          placeholder="Player name"
          placeholderTextColor={Colors.placeholder}
          className="rounded-xl border border-border-light bg-background px-4 py-3 text-base text-textPrimary"
          style={{ fontSize: 16 }}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          cursorColor={Colors.primary.DEFAULT}
          selectionColor={Colors.primary.DEFAULT}
        />
      </View>
      <View className="mb-4 rounded-2xl border border-border-light bg-card p-5 shadow-card">
        <Text className="mb-3 text-lg font-bold text-textPrimary">
          Opening bowler
        </Text>

        <TextInput
          value={openingBowler}
          onChangeText={(text) => {
            setError("");
            setOpeningBowler(text);
          }}
          placeholder="Player name"
          placeholderTextColor={Colors.placeholder}
          className="rounded-xl border border-border-light bg-background px-4 py-3 text-base text-textPrimary"
          style={{ fontSize: 16 }}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
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

      {/* SAVE BUTTON */}
      <Pressable
        onPress={handleStartMatch}
        className="items-center rounded-xl bg-primary py-4 shadow-card"
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <Text className="text-base font-bold text-text-inverse">
          Start Match
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default OpeningPlayersScreen;
