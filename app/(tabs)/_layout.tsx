import React from "react";
import { Tabs } from "expo-router";
import StTabBar from "@/src/components/navigation/tabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
        },
      }}
      tabBar={(props) => <StTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: "Главная" }} />
      <Tabs.Screen name="calendar" options={{ title: "Календарь" }} />
      <Tabs.Screen name="chat" options={{ title: "Чат" }} />
      <Tabs.Screen name="clients" options={{ title: "Клиенты" }} />
    </Tabs>
  );
}
