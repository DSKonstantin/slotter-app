import "../global.css";
import "@/src/utils/languages/i18nextConfig";
import { useEffect } from "react";
import { ThemeProvider } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { StatusBar } from "expo-status-bar";
import DefaultTheme from "@/src/styles/navigation/DefaultTheme";
import { useFonts } from "expo-font";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toasts } from "@backpackapp-io/react-native-toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "@/src/store/redux/store";
import "@/src/utils/calendarLocale";
import "@/src/utils/date/date";
import { useAuth } from "@/src/hooks/useAuth";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    IcoMoon: require("@/assets/icomoon/icomoon.ttf"),
  });

  const { isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (fontsLoaded && !isAuthLoading) {
      SplashScreen.hideAsync();
    }
  }, [isAuthLoading, fontsLoaded]);

  if (!fontsLoaded || isAuthLoading) {
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
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(onboarding)"
                  options={{ headerShown: false }}
                />
              </Stack>
              <Toasts overrideDarkMode={true} />
              <StatusBar style="auto" />
            </AutocompleteDropdownContextProvider>
          </KeyboardProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}
