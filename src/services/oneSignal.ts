import { useEffect, useRef } from "react";
import {
  OneSignal,
  LogLevel,
  NotificationClickEvent,
  NotificationWillDisplayEvent,
} from "react-native-onesignal";

const APP_ID = "96e7b141-c9c5-488d-93d4-2bccd58b8365";

export function loginOneSignal(type: "user" | "customer", id: number) {
  OneSignal.login(`${type}_${id}`);
}

export function logoutOneSignal() {
  OneSignal.logout();
}

export function requestOneSignalPermission() {
  void OneSignal.Notifications.requestPermission(true);
}

export function useOneSignal(
  onNotificationClick?: (event: NotificationClickEvent) => void,
) {
  const clickHandlerRef = useRef(onNotificationClick);
  clickHandlerRef.current = onNotificationClick;

  useEffect(() => {
    if (__DEV__) {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    }

    OneSignal.initialize(APP_ID);

    const clickListener = (event: NotificationClickEvent) => {
      clickHandlerRef.current?.(event);
    };

    const foregroundListener = (event: NotificationWillDisplayEvent) => {
      event.getNotification().display();
    };

    OneSignal.Notifications.addEventListener("click", clickListener);
    OneSignal.Notifications.addEventListener(
      "foregroundWillDisplay",
      foregroundListener,
    );

    return () => {
      OneSignal.Notifications.removeEventListener("click", clickListener);
      OneSignal.Notifications.removeEventListener(
        "foregroundWillDisplay",
        foregroundListener,
      );
    };
  }, []);
}
