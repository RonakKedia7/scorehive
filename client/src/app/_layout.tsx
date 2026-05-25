import { Stack } from "expo-router";
import "@/global.css";

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { View } from "react-native";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {
  return (
    <View className="flex-1 bg-background">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
          animation: "none",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            animation: "none",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="advanced-settings"
          options={{
            animation: "none",
          }}
        />
        <Stack.Screen
          name="opening-players"
          options={{
            animation: "none",
          }}
        />
        <Stack.Screen
          name="scoring"
          options={{
            animation: "none",
          }}
        />
      </Stack>
    </View>
  );
}
