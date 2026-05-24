import { Stack } from "expo-router";
import "@/global.css";

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // ← disables the strict mode warnings
});

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
