import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import * as Contacts from "expo-contacts";

type PermissionState = {
  status: Contacts.PermissionStatus | "loading";
  canAskAgain: boolean;
};

export function useContactsPermission() {
  const [state, setState] = useState<PermissionState>({
    status: "loading",
    canAskAgain: false,
  });

  const refresh = useCallback(async () => {
    const perm = await Contacts.getPermissionsAsync();
    setState({ status: perm.status, canAskAgain: perm.canAskAgain });
    return perm;
  }, []);

  const request = useCallback(async () => {
    const res = await Contacts.requestPermissionsAsync();
    setState({ status: res.status, canAskAgain: res.canAskAgain });
    return res;
  }, []);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const requestOrOpenSettings = useCallback(async () => {
    const current = await refresh();
    if (current.status === "granted") return current;
    if (current.canAskAgain) return await request();
    openSettings();
    return current;
  }, [openSettings, refresh, request]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    status: state.status,
    canAskAgain: state.canAskAgain,
    isGranted: state.status === "granted",
    isDenied: state.status === "denied",
    refresh,
    request,
    openSettings,
    requestOrOpenSettings,
  };
}
