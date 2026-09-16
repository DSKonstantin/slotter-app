import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import StTabBar from "@/src/components/navigation/tabBar";
import TabMenu from "@/src/components/navigation/tabBar/tabMenu";
import { useShowTabBar } from "@/src/hooks/useShowTabBar";

export default function AppLayout() {
  const showTabBar = useShowTabBar();

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat/[id]"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
        <Stack.Screen name="client/[id]" />
        <Stack.Screen name="client-notifications" />
        <Stack.Screen name="broadcast" />
        <Stack.Screen name="slot/[id]" />
        <Stack.Screen name="day-schedule" />
        <Stack.Screen name="create-slot-flow" />
        <Stack.Screen name="create-client" />
      </Stack>
      {showTabBar && <StTabBar />}
      <TabMenu />
    </View>
  );
}
