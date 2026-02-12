import "../global.css";
import "@/src/utils/languages/i18nextConfig";
import { useEffect, useState } from "react";
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
import { AuthProvider } from "@/src/providers/ auth/AuthProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [authReady, setAuthReady] = useState(false);
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    IcoMoon: require("@/assets/icomoon/icomoon.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded && authReady) {
      SplashScreen.hideAsync();
    }
  }, [authReady, fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DefaultTheme : DefaultTheme}
          >
            <KeyboardProvider>
              <AutocompleteDropdownContextProvider>
                <AuthProvider onReady={() => setAuthReady(true)}>
                  <Stack>
                    <Stack.Screen
                      name="index"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(auth)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                </AuthProvider>
                <Toasts overrideDarkMode={true} />
                <StatusBar style="auto" />
              </AutocompleteDropdownContextProvider>
            </KeyboardProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
