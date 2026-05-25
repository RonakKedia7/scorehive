import { useInnings } from "@/hooks/useInnings";
import { useMemo } from "react";
import { View, Text } from "react-native";

const PlayerStats = () => {
  const { innings, players } = useInnings();

  const findPlayer = (id: string | null) => (id ? (players[id] ?? null) : null);

  const striker = findPlayer(innings.strikerId);
  const nonStriker = findPlayer(innings.nonStrikerId);
  const bowler = findPlayer(innings.currentBowlerId);

  const batterRows = [
    striker
      ? {
          ...striker,
          isStriker: true,
        }
      : null,

    nonStriker
      ? {
          ...nonStriker,
          isStriker: false,
        }
      : null,
  ].filter(Boolean);

  return (
    <View className="mx-4 mt-4 bg-surface rounded-card border border-border-light shadow-card-md overflow-hidden">
      {/* BATTERS HEADER */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-surfaceSecondary border-b border-border-light">
        <Text className="text-text-secondary text-[11px] font-black tracking-[1px] uppercase">
          Batters
        </Text>

        <View className="flex-row">
          {["R", "B", "4s", "6s", "SR"].map((item) => (
            <Text
              key={item}
              className="w-10 text-center text-text-tertiary text-[11px] font-black"
            >
              {item}
            </Text>
          ))}
        </View>
      </View>

      {/* BATTERS */}
      {batterRows.map((player) => (
        <View
          key={player?.name}
          className="flex-row items-center justify-between px-5 py-4 border-b border-border-light"
        >
          <View className="flex-1 flex-row items-center">
            <Text className="w-4 mr-2 text-text-secondary font-black text-base">
              {player?.isStriker ? "*" : ""}
            </Text>

            <Text
              numberOfLines={1}
              className={`flex-1 text-sm font-bold
                      ${
                        player?.isStriker
                          ? "text-text-primary"
                          : "text-text-secondary"
                      }`}
            >
              {player?.name}
            </Text>
          </View>

          <View className="flex-row">
            <Text className="w-10 text-center text-text-primary font-black text-sm">
              {player?.stats?.batting.runs}
            </Text>

            <Text className="w-10 text-center text-text-secondary text-sm">
              {player?.stats?.batting.balls}
            </Text>

            <Text className="w-10 text-center text-text-secondary text-sm">
              {player?.stats?.batting.fours}
            </Text>

            <Text className="w-10 text-center text-text-secondary text-sm">
              {player?.stats?.batting.sixes}
            </Text>

            <Text className="w-10 text-center text-text-secondary font-bold text-sm">
              {player?.stats?.batting.strikeRate}
            </Text>
          </View>
        </View>
      ))}

      {/* BOWLER HEADER */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-surfaceSecondary border-b border-border-light">
        <Text className="text-text-secondary text-[11px] font-black tracking-[1px] uppercase">
          Bowler
        </Text>

        <View className="flex-row">
          {["O", "M", "R", "W", "ER"].map((item) => (
            <Text
              key={item}
              className="w-10 text-center text-text-tertiary text-[11px] font-black"
            >
              {item}
            </Text>
          ))}
        </View>
      </View>

      {/* BOWLER */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <Text
          numberOfLines={1}
          className="flex-1 text-sm font-bold text-text-primary"
        >
          {bowler?.name}
        </Text>

        <View className="flex-row">
          <Text className="w-10 text-center text-text-primary font-black text-sm">
            {bowler?.stats?.bowling.overs}.{bowler?.stats?.bowling.balls}
          </Text>

          <Text className="w-10 text-center text-text-secondary text-sm">
            {bowler?.stats?.bowling.maidens}
          </Text>

          <Text className="w-10 text-center text-text-secondary text-sm">
            {bowler?.stats?.bowling.runs}
          </Text>

          <Text className="w-10 text-center text-text-secondary font-black text-sm">
            {bowler?.stats?.bowling.wickets}
          </Text>

          <Text className="w-10 text-center text-text-secondary font-bold text-sm">
            {bowler?.stats?.bowling.economy}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PlayerStats;
