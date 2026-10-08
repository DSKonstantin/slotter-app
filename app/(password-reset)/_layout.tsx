import { Stack } from "expo-router";

export default function PasswordResetLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="enter-code" />
      <Stack.Screen name="new-password" />
    </Stack>
  );
}
