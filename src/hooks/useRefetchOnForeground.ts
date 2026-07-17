import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useNavigation } from "expo-router";
import { safeRefetch } from "@/src/utils/safeRefetch";

// useFocusEffect only fires on navigation focus changes, not on app
// background/foreground transitions — e.g. Home stays "focused" the whole
// time a user is away paying in an external browser (Linking.openURL) and
// back. This catches that return-to-foreground moment instead.
//
// Гейт по navigation.isFocused(): экраны в табах/стеке остаются
// смонтированными под другими экранами, и без проверки фокуса каждый
// подписчик стрелял бы на любой возврат в форграунд из любого места
// приложения. isFocused() спрашивается императивно в момент события —
// не протухает в замыкании.
export function useRefetchOnForeground(refetch: () => unknown) {
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const navigation = useNavigation();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active" &&
          navigation.isFocused()
        ) {
          safeRefetch(refetchRef.current);
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, [navigation]);
}
