import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="personal-information" />
      <Stack.Screen name="about" />
      <Stack.Screen name="links" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="preview" />
      <Stack.Screen name="gallery" />
      <Stack.Screen name="support" />
    </Stack>
  );
}
