import React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import StTabBar from "@/src/components/navigation/tabBar";
import TabMenu from "@/src/components/navigation/tabBar/tabMenu";
import { useChatRoomsIndexChannel } from "@/src/hooks/useChatRoomsIndexChannel";

function ChatRealtimeSetup() {
  useChatRoomsIndexChannel();
  return null;
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <ChatRealtimeSetup />
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
