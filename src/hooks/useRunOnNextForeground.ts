import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { safeRefetch } from "@/src/utils/safeRefetch";

// Одноразовое «выполни при следующем возврате в форграунд». Взводится
// императивно в момент ухода из приложения (Linking.openURL на оплату
// и т.п.): arm(fn) → при первом переходе background/inactive → active
// fn выполняется один раз и снимается со взвода.
//
// В отличие от useRefetchOnForeground не слушает каждый форграунд и не
// зависит от фокуса экрана — обычные сворачивания приложения без arm()
// ничего не дёргают.
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
