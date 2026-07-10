import { Stack } from "expo-router";

export default function ClientNotificationsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="direct" />
      <Stack.Screen name="direct-checkout-status" />
      <Stack.Screen name="direct-auth" />
      <Stack.Screen name="statistics" />
      <Stack.Screen name="types" />
      <Stack.Screen name="reminder" />
      <Stack.Screen name="reschedule" />
    </Stack>
  );
}
