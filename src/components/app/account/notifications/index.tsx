import React, { useEffect, useRef } from "react";
import { Alert, AppState, View } from "react-native";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Item, Switch } from "@/src/components/ui";
import { useNotificationPermission } from "@/src/hooks/useNotificationPermission";
import { requestOneSignalPermission } from "@/src/services/oneSignal";

const showSystemSettingsAlert = (title: string, openSettings: () => void) => {
  Alert.alert(
    title,
    "Настройки уведомлений доступны в настройках приложения.",
    [
      { text: "Отмена", style: "cancel" },
      { text: "Перейти в настройки", onPress: openSettings },
    ],
  );
};

const AccountNotifications = () => {
  const {
    isGranted,
    canAskAgain,
    requestOrOpenSettings,
    openSettings,
    refresh,
  } = useNotificationPermission();

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (appState.current !== "active" && nextState === "active") {
        void refresh();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [refresh]);

  const handleTogglePush = async (value: boolean) => {
    if (!value) {
      showSystemSettingsAlert("Отключить уведомления", openSettings);
      return;
    }
    if (!canAskAgain) {
      showSystemSettingsAlert("Включить уведомления", openSettings);
      return;
    }
    const result = await requestOrOpenSettings();
    if (result.status === "granted") {
      requestOneSignalPermission();
    }
    await refresh();
  };

  return (
    <ScreenWithToolbar title="Уведомления">
      {({ topInset }) => (
        <View style={{ paddingTop: topInset }} className="px-screen">
          <View className="overflow-hidden gap-2">
            <Item
              title="Push-уведомления"
              right={<Switch value={isGranted} onChange={handleTogglePush} />}
            />
          </View>
        </View>
      )}
    </ScreenWithToolbar>
  );
};

export default AccountNotifications;
