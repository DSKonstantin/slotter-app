import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";
import getRedirectPath from "@/src/utils/getOnboardingStep";

export default function OnboardingLayout() {
  const { user, isLoading } = useAuth();

  // Show a loading spinner if the auth status is still being determined.
  // This helps prevent flickers if the check is not instantaneous.
  if (isLoading) {
    return null; // The root layout handles the main loading spinner
  }

  // If there's no user, they shouldn't be in the onboarding flow. Redirect to login.
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // If the user is authenticated, but their onboarding is complete,
  // redirect them to the main app home.
  // This prevents users from re-entering the onboarding flow unnecessarily.
  const intendedPath = getRedirectPath(user);
  if (intendedPath.startsWith("/(app)")) {
    // If it's an app route, means onboarding is done
    return <Redirect href={intendedPath} />;
  }

  // Otherwise, render the onboarding screens.
  return (
    <Stack>
      {/* Define Stack.Screens for your onboarding pages here */}
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
