import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";
import getRedirectPath from "@/src/utils/getOnboardingStep";

export default function OnboardingLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const intendedPath = getRedirectPath(user);
  if (intendedPath.startsWith("/(app)")) {
    return <Redirect href={intendedPath} />;
  }

  return (
    <Stack>
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
