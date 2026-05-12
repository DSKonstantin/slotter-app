import React from "react";
import { Stack } from "expo-router";
export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="day-schedule/[id]" />
      <Stack.Screen name="day-schedule/create" />
      <Stack.Screen name="slot/[id]" />
      <Stack.Screen name="slot/select-service" />
      <Stack.Screen name="slot/create" />
    </Stack>
  );
}
