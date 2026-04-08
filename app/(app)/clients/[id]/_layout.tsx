import React from "react";
import { Stack } from "expo-router";

export default function ClientDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="statistics" />
      <Stack.Screen name="balance" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
