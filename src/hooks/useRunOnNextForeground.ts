import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { safeRefetch } from "@/src/utils/safeRefetch";

export function useRunOnNextForeground() {
  const pendingRef = useRef<(() => unknown) | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active" &&
          pendingRef.current
        ) {
          const pending = pendingRef.current;
          pendingRef.current = null;
          safeRefetch(pending);
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, []);

  return useCallback((fn: () => unknown) => {
    pendingRef.current = fn;
  }, []);
}
