import React from "react";
import { Tabs } from "expo-router";
import StTabBar from "@/src/components/navigation/tabBar";
import ToolbarTop from "@/src/components/navigation/toolbarTop";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <StTabBar {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Календарь",
          header: (props) => <ToolbarTop {...props} />,
        }}
      />
      <Tabs.Screen name="chat" options={{ title: "Чат" }} />
      <Tabs.Screen name="clients" options={{ title: "Клиенты" }} />
    </Tabs>
  );
}
