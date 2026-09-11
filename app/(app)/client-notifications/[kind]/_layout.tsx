import React from "react";
import { Stack } from "expo-router";

export default function ClientNotificationKindLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="editor" />
    </Stack>
  );
}
