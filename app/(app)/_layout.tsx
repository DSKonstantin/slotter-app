import React from "react";
import { Tabs } from "expo-router";
import StTabBar from "@/src/components/navigation/tabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <StTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="clients" />
    </Tabs>
  );
}
