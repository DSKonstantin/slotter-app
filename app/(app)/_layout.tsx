import React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import StTabBar from "@/src/components/navigation/tabBar";
import TabMenu from "@/src/components/navigation/tabBar/tabMenu";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <StTabBar {...props} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="calendar" />
        <Tabs.Screen name="chat" />
        <Tabs.Screen name="clients" />
      </Tabs>

      <TabMenu />
    </View>
  );
}
