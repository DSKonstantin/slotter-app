import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";
import getRedirectPath from "@/src/utils/getOnboardingStep";

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Handled by root layout's splash screen
  }

  if (user) {
    // If the user is authenticated, redirect to the main app.
    // getRedirectPath handles incomplete onboarding.
    return <Redirect href={getRedirectPath(user)} />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="restore-login" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} />
      <Stack.Screen name="enter-code" options={{ headerShown: false }} />
    </Stack>
  );
}
