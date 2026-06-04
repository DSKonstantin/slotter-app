import { Stack } from "expo-router";

export default function ClientNotificationsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="direct" />
      <Stack.Screen name="statistics" />
      <Stack.Screen name="types" />
    </Stack>
  );
}
