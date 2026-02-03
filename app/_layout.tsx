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
} from "@expo-google-fonts/inter";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { StatusBar } from "expo-status-bar";
import DefaultTheme from "@/src/styles/navigation/DefaultTheme";
import { useFonts } from "expo-font";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { KeyboardProvider } from "react-native-keyboard-controller";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    IcoMoon: require("@/assets/icomoon/icomoon.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hide();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DefaultTheme : DefaultTheme}>
      <KeyboardProvider>
        <AutocompleteDropdownContextProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </AutocompleteDropdownContextProvider>
      </KeyboardProvider>
    </ThemeProvider>
  );
}
