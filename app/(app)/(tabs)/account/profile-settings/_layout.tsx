import { Stack } from "expo-router";

export default function ProfileSettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="about-me" />
    </Stack>
  );
}
