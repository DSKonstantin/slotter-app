import "../global.css";
import "@/src/utils/languages/i18nextConfig";
import "dayjs/locale/ru";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { StatusBar } from "expo-status-bar";
import DefaultTheme from "@/src/styles/navigation/DefaultTheme";
import { useFonts } from "expo-font";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toasts } from "@backpackapp-io/react-native-toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/src/store/redux/store";
import "@/src/utils/calendarLocale";
import "@/src/utils/date/date";
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import { useAppVersionBootstrap } from "@/src/hooks/useAppVersionBootstrap";
import * as Sentry from "@sentry/react-native";
import "@/src/services/sentry";

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const appVersionReady = useAppVersionBootstrap();
  const { isAuthenticated, isOnboardingComplete, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    IcoMoon: require("@/assets/icomoon/icomoon.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded && !isLoading && appVersionReady) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded, appVersionReady]);

  if (!fontsLoaded || isLoading || !appVersionReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DefaultTheme : DefaultTheme}
        >
          <KeyboardProvider>
            <AutocompleteDropdownContextProvider>
              <BottomSheetModalProvider>
                <Stack>
                  <Stack.Protected
                    guard={isAuthenticated && isOnboardingComplete}
                  >
                    <Stack.Screen
                      name="(app)"
                      options={{ headerShown: false }}
                    />
                  </Stack.Protected>
                  <Stack.Protected
                    guard={isAuthenticated && !isOnboardingComplete}
                  >
                    <Stack.Screen
                      name="(onboarding)"
                      options={{ headerShown: false }}
                    />
                  </Stack.Protected>
                  <Stack.Protected guard={!isAuthenticated}>
                    <Stack.Screen
                      name="(auth)"
                      options={{ headerShown: false }}
                    />
                  </Stack.Protected>
                  <Stack.Screen
                    name="(password-reset)"
                    options={{ headerShown: false }}
                  />
                </Stack>
                <Toasts overrideDarkMode={true} />
                <StatusBar style="auto" />
              </BottomSheetModalProvider>
            </AutocompleteDropdownContextProvider>
          </KeyboardProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <InitialLayout />
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
});
