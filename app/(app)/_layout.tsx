import React from "react";
import { View } from "react-native";
import { Stack, useSegments } from "expo-router";
import StTabBar from "@/src/components/navigation/tabBar";

export default function AppLayout() {
  const segments = useSegments() as string[];
  const showTabBar = segments[1] !== "chat";

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat/[id]"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="mySpecialists"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="notifications"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
      </Stack>
      {showTabBar && <StTabBar />}
    </View>
  );
}
