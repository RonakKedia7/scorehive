import { View, Text, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

export default function LiveScoringScreen() {
  // --- DUMMY DATA ---
  const currentInnings = 1;

  const innings = {
    battingTeam: "INDIA",
    totalRuns: 98,
    wickets: 3,
    overs: 12,
    balls: 3,
    thisOver: ["1", "0", "2", "W", "1", "4"],
  };

  const striker = {
    name: "R Sharma",
    runs: 34,
    balls: 28,
    fours: 5,
    sixes: 1,
    strikeRate: ((34 / 28) * 100).toFixed(1),
  };

  const nonStriker = {
    name: "V Kohli",
    runs: 67,
    balls: 38,
    fours: 9,
    sixes: 2,
    strikeRate: ((67 / 38) * 100).toFixed(1),
  };

  const bowler = {
    name: "M Starc",
    overs: 4,
    balls: 2,
    maidens: 0,
    runs: 28,
    wickets: 2,
    economy: (28 / (4 + 2 / 6)).toFixed(1),
  };

  const totalOvers = innings.overs + innings.balls / 6;
  const crr = (innings.totalRuns / totalOvers).toFixed(2);

  const batterRows = [
    {
      ...striker,
      isStriker: true,
    },
    {
      ...nonStriker,
      isStriker: false,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 border border-border-light bg-surface">
        <TouchableOpacity className="w-11 h-11 rounded-card items-center justify-center">
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center shadow-card-sm"
        >
          <Ionicons name="stats-chart" size={18} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* SCORE CARD */}
      <View className="mx-4 bg-surface rounded-b-card border border-t-0 border-border-light shadow-card-md overflow-hidden">
        {/* TOP */}
        <View className="p-card">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-text-tertiary text-[11px] font-bold tracking-[2px]">
                INNINGS {currentInnings}
              </Text>

              <Text className="text-text-primary text-3xl font-black mt-1">
                {innings.battingTeam}
              </Text>
            </View>

            <View className="bg-background px-4 py-3 rounded-card items-center ">
              <Text className="text-text-tertiary text-[10px] font-bold">
                CURRENT RR
              </Text>

              <Text className="text-primary-500 text-xl font-black mt-0.5">
                {crr}
              </Text>
            </View>
          </View>

          {/* SCORE */}
          <View className="flex-row items-end mt-2">
            <Text className="text-[58px] leading-[62px] font-black text-text-primary">
              {innings.totalRuns}
            </Text>

            <Text className="text-[38px] leading-[44px] font-black text-danger ml-1">
              /{innings.wickets}
            </Text>

            <Text className="text-text-secondary text-xl font-bold ml-4 mb-2">
              ({innings.overs}.{innings.balls})
            </Text>
          </View>
        </View>

        {/* THIS OVER */}
        <View className="border-t border-border-light bg-surfaceSecondary px-5 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-primary text-sm font-black tracking-wide">
              THIS OVER
            </Text>
          </View>

          <View className="h-[46px]">
            <FlashList
              data={innings.thisOver}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item}-${index}`}
              ItemSeparatorComponent={() => <View className="w-3" />}
              renderItem={({ item }) => {
                const isWicket = item === "W";
                const isBoundary = item === "4" || item === "6";
                const isExtra = item.includes("Wd") || item.includes("Nb");

                return (
                  <View
                    className={`w-[46px] h-[46px] rounded-full items-center justify-center border
                      ${
                        isWicket
                          ? "bg-danger border-danger-dark"
                          : isBoundary
                            ? "bg-secondary border-secondary-700"
                            : isExtra
                              ? "bg-warning border-warning-dark"
                              : "bg-surface border-border-light"
                      }`}
                  >
                    <Text
                      className={`font-black text-base
                        ${
                          isWicket || isBoundary || isExtra
                            ? "text-text-inverse"
                            : "text-text-primary"
                        }`}
                    >
                      {item}
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </View>

      {/* PLAYER STATS */}
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
            key={player.name}
            className="flex-row items-center justify-between px-5 py-4 border-b border-border-light"
          >
            <View className="flex-1 flex-row items-center">
              <Text className="w-4 mr-2 text-text-secondary font-black text-base">
                {player.isStriker ? "*" : ""}
              </Text>

              <Text
                numberOfLines={1}
                className={`flex-1 text-sm font-bold
                  ${
                    player.isStriker
                      ? "text-text-primary"
                      : "text-text-secondary"
                  }`}
              >
                {player.name}
              </Text>
            </View>

            <View className="flex-row">
              <Text className="w-10 text-center text-text-primary font-black text-sm">
                {player.runs}
              </Text>

              <Text className="w-10 text-center text-text-secondary text-sm">
                {player.balls}
              </Text>

              <Text className="w-10 text-center text-text-secondary text-sm">
                {player.fours}
              </Text>

              <Text className="w-10 text-center text-text-secondary text-sm">
                {player.sixes}
              </Text>

              <Text className="w-10 text-center text-text-secondary font-bold text-sm">
                {player.strikeRate}
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
            {bowler.name}
          </Text>

          <View className="flex-row">
            <Text className="w-10 text-center text-text-primary font-black text-sm">
              {bowler.overs}.{bowler.balls}
            </Text>

            <Text className="w-10 text-center text-text-secondary text-sm">
              {bowler.maidens}
            </Text>

            <Text className="w-10 text-center text-text-secondary text-sm">
              {bowler.runs}
            </Text>

            <Text className="w-10 text-center text-text-secondary font-black text-sm">
              {bowler.wickets}
            </Text>

            <Text className="w-10 text-center text-text-secondary font-bold text-sm">
              {bowler.economy}
            </Text>
          </View>
        </View>
      </View>

      {/* CONTROL PAD */}
      <View className="flex-1 flex-row mx-4 mt-4 mb-5 gap-3">
        {/* LEFT CONTROLS */}
        <View className="w-[28%] gap-3">
          <View className="flex-row gap-3">
            {["WD", "NB"].map((item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                className="flex-1 rounded-btn items-center justify-center bg-warning border border-warning-dark shadow-card-sm py-2"
              >
                <Text className="font-black text-text-inverse tracking-wide">
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row gap-3">
            {["B", "LB"].map((item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                className="flex-1 rounded-btn items-center justify-center bg-info border border-info-dark shadow-card-sm py-2"
              >
                <Text className="font-black text-text-inverse tracking-wide">
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            className="h-10 rounded-card bg-surface border border-border-light items-center justify-center shadow-card-sm"
          >
            <Text className="text-text-secondary text-[10px] font-black tracking-wide uppercase">
              Undo
            </Text>
          </TouchableOpacity>
        </View>

        {/* NUMPAD */}
        <View className="flex-1 pl-2 justify-between">
          <View className="flex-row flex-wrap justify-between">
            {[0, 1, 2, 3, 4, 5, 6].map((num) => (
              <TouchableOpacity
                key={num}
                activeOpacity={0.85}
                className={`
          w-[31%]
          h-[40px]
          mb-3
          rounded-card
          items-center
          justify-center
          border
          shadow-card-sm

          ${
            num === 4 || num === 6
              ? "bg-secondary border-secondary-700"
              : "bg-primary-500 border-primary-600"
          }
        `}
              >
                <Text className="text-text-inverse text-[30px] font-black">
                  {num}
                </Text>
              </TouchableOpacity>
            ))}

            {/* WICKET */}
            <TouchableOpacity
              activeOpacity={0.85}
              className="
        w-[31%]
        h-[40px]
        mb-3
        rounded-card
        bg-danger
        border
        border-danger-dark
        items-center
        justify-center
        shadow-card-sm
      "
            >
              <Text className="text-text-inverse text-[30px] font-black">
                W
              </Text>
            </TouchableOpacity>

            {/* RETIRE */}
            <TouchableOpacity
              activeOpacity={0.85}
              className="
        w-[31%]
        h-[40px]
        mb-3
        rounded-card
        bg-surface
        border
        border-border-light
        items-center
        justify-center
        shadow-card-sm
      "
            >
              <Text className="text-text-secondary text-[11px] font-bold uppercase tracking-wide">
                Retire
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
