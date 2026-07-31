import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useNavigation } from "expo-router";
import { safeRefetch } from "@/src/utils/safeRefetch";

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
