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

        <View className="flex-row shrink-0">
          {["R", "B", "4s", "6s", "SR"].map((item, index) => (
            <Text
              key={item}
              className={`text-center text-text-tertiary text-[11px] font-black
      ${index === 4 ? "w-12" : "w-8"}`}
            >
              {item}
            </Text>
          ))}
        </View>
      </View>

      {/* BATTERS */}
      {batterRows.map((player) => (
        <View
          key={player?.id}
          className="flex-row items-center px-5 py-4 border-b border-border-light h-[56px]"
        >
          {/* LEFT PLAYER SECTION */}
          <View className="flex-1 flex-row items-center pr-2 min-w-0">
            <Text className="w-4 mr-2 text-text-secondary font-black text-base shrink-0">
              {player?.isStriker ? "*" : ""}
            </Text>

            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className={`flex-1 text-sm font-bold min-w-0
        ${player?.isStriker ? "text-text-primary" : "text-text-secondary"}`}
            >
              {player?.name}
            </Text>
          </View>

          {/* RIGHT STATS SECTION */}
          <View className="flex-row shrink-0">
            <Text
              numberOfLines={1}
              className="w-8 text-center text-text-primary font-black text-sm"
            >
              {player?.stats?.batting.runs}
            </Text>

            <Text
              numberOfLines={1}
              className="w-8 text-center text-text-secondary text-sm"
            >
              {player?.stats?.batting.balls}
            </Text>

            <Text
              numberOfLines={1}
              className="w-8 text-center text-text-secondary text-sm"
            >
              {player?.stats?.batting.fours}
            </Text>

            <Text
              numberOfLines={1}
              className="w-8 text-center text-text-secondary text-sm"
            >
              {player?.stats?.batting.sixes}
            </Text>

            <Text
              numberOfLines={1}
              className="w-12 text-center text-text-secondary font-bold text-sm"
            >
              {player?.stats?.batting.strikeRate != null
                ? player.stats.batting.strikeRate.toFixed(1)
                : "0.0"}
            </Text>
          </View>
        </View>
      ))}

      {/* BOWLER HEADER */}
      <View className="flex-row items-center justify-between px-5 py-3 bg-surfaceSecondary border-b border-border-light">
        <Text className="text-text-secondary text-[11px] font-black tracking-[1px] uppercase">
          Bowler
        </Text>

        <View className="flex-row shrink-0">
          {["O", "M", "R", "W", "ER"].map((item, index) => (
            <Text
              key={item}
              className={`${index === 4 ? "w-12" : "w-8"} text-center text-text-tertiary text-[11px] font-black`}
            >
              {item}
            </Text>
          ))}
        </View>
      </View>

      {/* BOWLER */}
      <View className="flex-row items-center px-5 py-4 h-[56px]">
        {/* LEFT NAME SECTION */}
        <View className="flex-1 pr-2 min-w-0">
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-sm font-bold text-text-primary"
          >
            {bowler?.name}
          </Text>
        </View>

        {/* RIGHT STATS SECTION */}
        <View className="flex-row shrink-0">
          <Text
            numberOfLines={1}
            className="w-8 text-center text-text-primary font-black text-sm"
          >
            {`${bowler?.stats?.bowling.overs ?? 0}.${bowler?.stats?.bowling.balls ?? 0}`}
          </Text>

          <Text
            numberOfLines={1}
            className="w-8 text-center text-text-secondary text-sm"
          >
            {bowler?.stats?.bowling.maidens}
          </Text>

          <Text
            numberOfLines={1}
            className="w-8 text-center text-text-secondary text-sm"
          >
            {bowler?.stats?.bowling.runs}
          </Text>

          <Text
            numberOfLines={1}
            className="w-8 text-center text-text-secondary font-black text-sm"
          >
            {bowler?.stats?.bowling.wickets}
          </Text>

          <Text
            numberOfLines={1}
            className="w-12 text-center text-text-secondary font-bold text-sm"
          >
            {bowler?.stats?.bowling.economy != null
              ? bowler.stats.bowling.economy.toFixed(1)
              : "0.0"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PlayerStats;
