import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import * as Notifications from "expo-notifications";

type PermissionState = {
  status: Notifications.PermissionStatus | "loading";
  canAskAgain: boolean;
};

export function useNotificationPermission() {
  const [state, setState] = useState<PermissionState>({
    status: "loading",
    canAskAgain: false,
  });

  const refresh = useCallback(async () => {
    const perm = await Notifications.getPermissionsAsync();

    setState({
      status: perm.status,
      canAskAgain: perm.canAskAgain,
    });

    return perm;
  }, []);

  const request = useCallback(async () => {
    const res = await Notifications.requestPermissionsAsync();

    setState({
      status: res.status,
      canAskAgain: res.canAskAgain,
    });

    return res;
  }, []);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const requestOrOpenSettings = useCallback(async () => {
    const current = await refresh();

    if (current.status === "granted") return current;

    // можно показать системное окно разрешения
    if (current.canAskAgain) {
      return await request();
    }

    // нельзя спросить снова -> только настройки
    openSettings();
    return current;
  }, [openSettings, refresh, request]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isGranted = state.status === "granted";
  const isDenied = state.status === "denied";

  return {
    status: state.status,
    canAskAgain: state.canAskAgain,

    isGranted,
    isDenied,

    refresh,
    request,
    openSettings,
    requestOrOpenSettings,
  };
}
