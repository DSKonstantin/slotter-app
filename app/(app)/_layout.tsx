import React from "react";
import { View } from "react-native";
import { Stack, useSegments } from "expo-router";
import StTabBar from "@/src/components/navigation/tabBar";
import TabMenu from "@/src/components/navigation/tabBar/tabMenu";

export default function AppLayout() {
  const segments = useSegments() as string[];
  const showTabBar = segments[1] !== "chat" && segments[1] !== "payment";

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat/[id]"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="chat/client-history/[id]"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
        <Stack.Screen name="create-slot-flow" />
        <Stack.Screen name="create-client" />
      </Stack>
      {showTabBar && <StTabBar />}
      <TabMenu />
    </View>
  );
}
