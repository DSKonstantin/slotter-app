import { useCallback, useRef } from "react";
import { Platform } from "react-native";

// onModalHide fires after the JS animation but before iOS UIKit finishes
// dismissing the native view controller — presenting a new VC immediately
// causes it to be silently swallowed on iOS.
const MODAL_DISMISS_DELAY = Platform.OS === "ios" ? 100 : 0;

export function useModalAction(close: () => void) {
  const pendingAction = useRef<(() => void | Promise<void>) | null>(null);

  const scheduleAction = useCallback(
    (action: () => void | Promise<void>) => {
      pendingAction.current = action;
      close();
    },
    [close],
  );

  const onModalHide = useCallback(() => {
    const action = pendingAction.current;
    pendingAction.current = null;
    if (action) setTimeout(action, MODAL_DISMISS_DELAY);
  }, []);

  return { scheduleAction, onModalHide };
}
