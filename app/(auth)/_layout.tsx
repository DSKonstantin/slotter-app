import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="restore-login" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
      <Stack.Screen name="enter-code" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="experience" options={{ headerShown: false }} />
      <Stack.Screen name="database" options={{ headerShown: false }} />
      <Stack.Screen name="database-success" options={{ headerShown: false }} />
      <Stack.Screen
        name="personal-information"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="service" options={{ headerShown: false }} />
      <Stack.Screen name="schedule" options={{ headerShown: false }} />
      <Stack.Screen name="notification" options={{ headerShown: false }} />
      <Stack.Screen name="link" options={{ headerShown: false }} />
    </Stack>
  );
}
