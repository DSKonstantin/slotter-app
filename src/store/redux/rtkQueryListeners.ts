import NetInfo from "@react-native-community/netinfo";
import type { setupListeners } from "@reduxjs/toolkit/query";
import { AppState, AppStateStatus } from "react-native";

export const rtkQueryListenerHandler: NonNullable<
  Parameters<typeof setupListeners>[1]
> = (dispatch, { onFocus, onFocusLost, onOnline, onOffline }) => {
  let appState = AppState.currentState;

  const appStateSubscription = AppState.addEventListener(
    "change",
    (nextAppState: AppStateStatus) => {
      if (nextAppState === appState) return;

      if (appState.match(/inactive|background/) && nextAppState === "active") {
        dispatch(onFocus());
      } else if (nextAppState.match(/inactive|background/)) {
        dispatch(onFocusLost());
      }

      appState = nextAppState;
    },
  );

  const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected === false) {
      dispatch(onOffline());
    } else if (state.isConnected === true) {
      dispatch(onOnline());
    }
  });

  return () => {
    appStateSubscription.remove();
    netInfoUnsubscribe();
  };
};
