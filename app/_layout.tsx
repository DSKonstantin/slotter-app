import "../global.css";
import "@/src/utils/languages/i18nextConfig";
import "dayjs/locale/ru";
import { useEffect, useRef } from "react";
import { ThemeProvider } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { Stack, useRouter } from "expo-router";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
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
import { persistor, store, useAppSelector } from "@/src/store/redux/store";
import "@/src/utils/calendarLocale";
import "@/src/utils/date/date";
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import { useAppVersionBootstrap } from "@/src/hooks/useAppVersionBootstrap";
import AppUpdateModal from "@/src/components/shared/modals/AppUpdateModal";
import NoInternetScreen from "@/src/components/shared/NoInternetScreen";
import CrashFallback from "@/src/components/shared/CrashFallback";
import * as Sentry from "@sentry/react-native";
import { useSentryUserSync } from "@/src/services/sentry";
import {
  useOneSignal,
  loginOneSignal,
  logoutOneSignal,
} from "@/src/services/oneSignal";
import { Routers } from "@/src/constants/routers";
import { useOpenPersonalAccount } from "@/src/hooks/useOpenPersonalAccount";
import { handleKindNavigation } from "@/src/utils/notificationNavigation";

SplashScreen.preventAutoHideAsync().catch(() => {});

const FONTS = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  IcoMoon: require("@/assets/icomoon/icomoon.ttf"),
};

function InitialLayout() {
  const router = useRouter();
  const authUser = useAppSelector((s) => s.auth.user);
  const authStatus = useAppSelector((s) => s.auth.status);

  useSentryUserSync();
  const openPersonalAccount = useOpenPersonalAccount();

  useOneSignal((event) => {
    const { kind, subject_id } = (event.notification.additionalData ?? {}) as {
      kind?: string;
      subject_id?: number;
    };

    if (handleKindNavigation(kind, openPersonalAccount)) return;

    if (
      kind?.startsWith("appointment_") ||
      kind?.startsWith("rebook_") ||
      kind === "review_request"
    ) {
      if (subject_id) router.push(Routers.app.slot(subject_id));
    } else if (kind === "chat_new_activity") {
      if (subject_id) router.push(Routers.app.chat.room(subject_id));
    } else {
      router.push(Routers.app.account.notifications);
    }
  });

  const {
    ready: appVersionReady,
    isLoading: isVersionLoading,
    isError: appVersionError,
    retry,
  } = useAppVersionBootstrap();
  const {
    isAuthenticated,
    isOnboardingComplete,
    isLoading,
    isError: isAuthError,
    retry: retryAuth,
  } = useAuth();
  const [fontsLoaded] = useFonts(FONTS);

  const isReady =
    fontsLoaded && !isLoading && (appVersionReady || appVersionError);
  const wasReadyRef = useRef(false);
  if (isReady) wasReadyRef.current = true;
  const showApp = isReady || wasReadyRef.current;

  useEffect(() => {
    if (showApp) SplashScreen.hideAsync().catch(() => {});
  }, [showApp]);

  useEffect(() => {
    if (authStatus === "authenticated" && authUser) {
      loginOneSignal("user", authUser.id);
    } else if (authStatus === "unauthenticated") {
      logoutOneSignal();
    }
  }, [authUser, authStatus]);

  if (!showApp) {
    return null;
  }

  if (appVersionError || isAuthError) {
    return (
      <NoInternetScreen
        onRetry={appVersionError ? retry : retryAuth}
        isRetrying={appVersionError ? isVersionLoading : isLoading}
      />
    );
  }

  return (
    <>
      <Stack>
        <Stack.Protected guard={isAuthenticated && isOnboardingComplete}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen
          name="(password-reset)"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="webview" options={{ headerShown: false }} />
      </Stack>
      <Toasts overrideDarkMode={true} />
      <StatusBar style="auto" />
      {appVersionReady && <AppUpdateModal />}
    </>
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Sentry.GlobalErrorBoundary fallback={CrashFallback}>
          <ThemeProvider value={DefaultTheme}>
            <KeyboardProvider>
              <AutocompleteDropdownContextProvider>
                <BottomSheetModalProvider>
                  <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                      <AuthProvider>
                        <InitialLayout />
                      </AuthProvider>
                    </PersistGate>
                  </Provider>
                </BottomSheetModalProvider>
              </AutocompleteDropdownContextProvider>
            </KeyboardProvider>
          </ThemeProvider>
        </Sentry.GlobalErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});
