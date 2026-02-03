import React from "react";
import { Tabs } from "expo-router";
import { StSvg } from "@/src/components/ui";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <StSvg name="Home" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
