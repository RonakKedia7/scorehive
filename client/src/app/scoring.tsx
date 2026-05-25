import { SafeAreaView } from "react-native-safe-area-context";
import ScoreCard from "@/components/scoring/ScoreCard";
import Header from "@/components/scoring/Header";
import PlayerStats from "@/components/scoring/PlayerStats";
import ControlPad from "@/components/scoring/ControlPad";

export default function LiveScoringScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header />
      <ScoreCard />
      <PlayerStats />
      <ControlPad />
    </SafeAreaView>
  );
}
