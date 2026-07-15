import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { safeRefetch } from "@/src/utils/safeRefetch";

// useFocusEffect only fires on navigation focus changes, not on app
// background/foreground transitions — e.g. Home stays "focused" the whole
// time a user is away paying in an external browser (Linking.openURL) and
// back. This catches that return-to-foreground moment instead.
export function useRefetchOnForeground(refetch: () => unknown) {
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          safeRefetch(refetchRef.current);
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, []);
}
