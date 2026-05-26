import { useInitialMatchSetup } from "@/stores/useInitialMatchSetup";
import { useScoringStore } from "@/stores/useScoringStore";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const ControlPad = () => {
  const router = useRouter();
  const { matchRules } = useInitialMatchSetup();
  const { innings1, innings2, currentInnings, addBall, overCompleted } =
    useScoringStore();

  const wideAndNoBallArray = [
    matchRules.wide.enabled ? "WD" : null,
    matchRules.noBall.enabled ? "NB" : null,
  ].filter(Boolean);

  const guardOverCompleted = () => {
    if (overCompleted) {
      router.push("/new-bowler");
      return true; // caller can abort
    }
    return false;
  };

  const handleBall = (runs: number) => {
    if (guardOverCompleted()) return; // <-- prevent scoring

    const currentInningsData = currentInnings === 1 ? innings1 : innings2;
    const prevBalls = currentInningsData.balls;
    addBall(`${runs}`);

    const newInnings =
      currentInnings === 1
        ? useScoringStore.getState().innings1
        : useScoringStore.getState().innings2;

    if (prevBalls === 5 && newInnings.balls === 0 && newInnings.overs > 0) {
      router.push("/new-bowler"); // normal over completion
    }
  };

  return (
    <View className="flex-1 flex-row mx-4 mt-4 mb-5 gap-3">
      {/* LEFT CONTROLS */}
      <View className="w-[28%] gap-3">
        <View className="flex-row gap-3">
          {wideAndNoBallArray.length > 0 &&
            wideAndNoBallArray.map((item) => (
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
              onPress={() => handleBall(num)}
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
            <Text className="text-text-inverse text-[30px] font-black">W</Text>
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
  );
};

export default ControlPad;
