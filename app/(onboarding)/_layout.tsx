import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { Routers } from "@/src/constants/routers";

export default function OnboardingLayout() {
  const { isOnboardingComplete } = useAuth();

  if (isOnboardingComplete) {
    return <Redirect href={Routers.app.root} />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
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
