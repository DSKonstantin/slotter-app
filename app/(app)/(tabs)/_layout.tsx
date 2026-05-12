import React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";

import StTabBar from "@/src/components/navigation/tabBar";
import TabMenu from "@/src/components/navigation/tabBar/tabMenu";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <StTabBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />

        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
          }}
        />

        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
          }}
        />

        <Tabs.Screen
          name="clients"
          options={{
            title: "Clients",
          }}
        />

        <Tabs.Screen
          name="account"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="finances"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="services"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="history"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="schedule"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <TabMenu />
    </View>
  );
}
