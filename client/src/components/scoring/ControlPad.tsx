import { useInitialMatchSetup } from "@/stores/useInitialMatchSetup";
import { useScoringStore } from "@/stores/useScoringStore";
import { View, Text, Modal, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";

const ControlPad = () => {
  const router = useRouter();
  const isRedirecting = useRef(false);
  const { matchRules } = useInitialMatchSetup();
  const { innings1, innings2, currentInnings, addBall } = useScoringStore();

  const [extrasModalVisible, setExtrasModalVisible] = useState(false);
  const [extrasCode, setExtrasCode] = useState<"wd" | "nb" | "b" | "lb">("wd");

  const wideAndNoBallArray = [
    matchRules.wide.enabled ? "WD" : null,
    matchRules.noBall.enabled ? "NB" : null,
  ].filter(Boolean);

  const guardOverCompleted = () => {
    if (useScoringStore.getState().overCompleted) {
      if (!isRedirecting.current) {
        isRedirecting.current = true;
        router.push("/new-bowler");
      }
      return true;
    }
    isRedirecting.current = false;
    return false;
  };

  const handleBall = (runs: number) => {
    if (guardOverCompleted()) return; // <-- prevent scoring

    const currentInningsData = currentInnings === 1 ? innings1 : innings2;
    const prevBalls = currentInningsData.ballsInOver;
    addBall(`${runs}`);

    const newInnings =
      currentInnings === 1
        ? useScoringStore.getState().innings1
        : useScoringStore.getState().innings2;

    if (
      prevBalls === 5 &&
      newInnings.ballsInOver === 0 &&
      newInnings.overs > 0
    ) {
      router.push("/new-bowler"); // normal over completion
    }
  };

  const openExtrasModal = (code: "wd" | "nb" | "b" | "lb") => {
    if (guardOverCompleted()) return;
    setExtrasCode(code);
    setExtrasModalVisible(true);
  };

  const applyExtra = (runs: number) => {
    setExtrasModalVisible(false);
    addBall(`${runs}${extrasCode}`);
  };

  const handleWicketClick = () => {
    if (guardOverCompleted()) return;
    router.push("/wicket");
  };

  const handleUndo = () => {
    useScoringStore.getState().undo();
  };

  const handleSwapBatsman = () => {
    if (guardOverCompleted()) return;
    useScoringStore.getState().swapBatsmen();
  };

  const handleRetire = () => {
    if (guardOverCompleted()) return;
    router.push("/retire-batsman?type=hurt");
  };

  return (
    <View className="flex-1 flex-row mx-4 mt-4 mb-5 gap-3">
      {/* LEFT CONTROLS */}
      <View className="w-[30%] gap-2">
        <View className="flex-row gap-2">
          {wideAndNoBallArray.length > 0 &&
            wideAndNoBallArray.map((item) => (
              <Pressable
                key={item}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
                className="flex-1 rounded-btn items-center justify-center bg-warning border border-warning-dark shadow-card-sm py-2"
                onPress={() => openExtrasModal(item === "WD" ? "wd" : "nb")}
              >
                <Text className="font-black text-text-inverse tracking-wide">
                  {item}
                </Text>
              </Pressable>
            ))}
        </View>

        <View className="flex-row gap-2">
          {["B", "LB"].map((item) => (
            <Pressable
              key={item}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
              className="flex-1 rounded-btn items-center justify-center bg-info border border-info-dark shadow-card-sm py-2"
              onPress={() => openExtrasModal(item === "B" ? "b" : "lb")}
            >
              <Text className="font-black text-text-inverse tracking-wide">
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* UNDO + SWAP SAME ROW */}
        <View className="flex-row gap-2">
          <Pressable
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
            className="flex-1 h-9 rounded-card bg-surface border border-border-light items-center justify-center shadow-card-sm"
            onPress={handleUndo}
          >
            <Text className="text-text-secondary text-[9px] font-black tracking-wide uppercase">
              Undo
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSwapBatsman}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
            className="flex-1 h-9 rounded-card bg-surface border border-border-light items-center justify-center shadow-card-sm"
          >
            <Text className="text-text-secondary text-[9px] font-black tracking-wide uppercase">
              Swap
            </Text>
          </Pressable>
        </View>
      </View>

      {/* NUMPAD */}
      <View className="flex-1 pl-1 justify-between">
        <View className="flex-row flex-wrap justify-between">
          {[0, 1, 2, 3, 4, 5, 6].map((num) => (
            <Pressable
              key={num}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
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
            </Pressable>
          ))}

          {/* WICKET */}
          <Pressable
            onPress={handleWicketClick}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
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
          </Pressable>

          {/* RETIRE */}
          <Pressable
            onPress={handleRetire}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
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
          </Pressable>
        </View>
      </View>

      <Modal
        visible={extrasModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExtrasModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-background/70 px-6"
          onPress={() => setExtrasModalVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            className="w-full max-w-[360px] rounded-3xl border border-border-light bg-surface p-6 shadow-card-lg"
            style={({ pressed }) => ({ opacity: pressed ? 0.98 : 1 })}
          >
            {/* HEADER */}
            <View className="mb-5 items-center">
              <Text className="text-2xl font-extrabold tracking-tight text-text-primary">
                {extrasCode === "wd"
                  ? "Wide"
                  : extrasCode === "nb"
                    ? "No Ball"
                    : extrasCode === "b"
                      ? "Bye"
                      : "Leg Bye"}
              </Text>
              <Text className="mt-1 text-sm text-text-secondary">
                Select extra runs
              </Text>
            </View>

            {/* RUN BUTTONS */}
            <View className="flex-row flex-wrap justify-center gap-3">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((runs) => (
                <Pressable
                  key={runs}
                  onPress={() => applyExtra(runs)}
                  className="h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-card"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}
                >
                  <Text className="text-xl font-black text-text-inverse">
                    {runs}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* CANCEL BUTTON */}
            <Pressable
              onPress={() => setExtrasModalVisible(false)}
              className="mt-6 items-center rounded-2xl border border-border-light bg-surfaceSecondary py-4"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Text className="text-base font-bold text-text-primary">
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ControlPad;
