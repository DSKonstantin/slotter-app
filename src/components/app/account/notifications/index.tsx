import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import RetryInline from "@/src/components/shared/retryInline";
import { Item, Switch } from "@/src/components/ui";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefresh } from "@/src/hooks/useRefresh";
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} from "@/src/store/redux/services/api/notificationsApi";
import type { NotificationKind } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { useNotificationPermission } from "@/src/hooks/useNotificationPermission";
import { requestOneSignalPermission } from "@/src/services/oneSignal";
import { asArray } from "@/src/utils/asArray";

const showSystemSettingsAlert = (title: string, openSettings: () => void) => {
  Alert.alert(title, "Настройте уведомления в настройках приложения.", [
    { text: "Отмена", style: "cancel" },
    { text: "Перейти в настройки", onPress: openSettings },
  ]);
};

const AccountNotifications = () => {
  const auth = useRequiredAuth();
  const {
    isGranted,
    canAskAgain,
    requestOrOpenSettings,
    openSettings,
    refresh,
  } = useNotificationPermission();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetNotificationSettingsQuery(auth ? auth.userId : skipToken);

  const { refreshing, onRefresh } = useRefresh(refetch);

  const [updateSettings] = useUpdateNotificationSettingsMutation();

  const handleToggle = useCallback(
    (kind: NotificationKind, currentEnabled: boolean) => {
      if (!auth) return;
      updateSettings({
        userId: auth.userId,
        self: { [kind]: !currentEnabled },
      })
        .unwrap()
        .catch((e: unknown) => {
          toast.error(getApiErrorMessage(e, "Не удалось сохранить настройки"));
        });
    },
    [auth, updateSettings],
  );

  const appState = useRef(AppState.currentState);

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

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (appState.current !== "active" && nextState === "active") {
        void refresh();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [refresh]);

  return (
    <ScreenWithToolbar title="Уведомления">
      {({ topInset, bottomInset }) => (
        <ScrollView
          className="px-screen"
          showsVerticalScrollIndicator={false}
          contentInset={Platform.OS === "ios" ? { top: topInset } : undefined}
          contentOffset={
            Platform.OS === "ios" ? { x: 0, y: -topInset } : undefined
          }
          contentContainerStyle={{
            paddingTop: Platform.OS === "ios" ? 0 : topInset,
            paddingBottom: bottomInset + 16,
          }}
          refreshControl={
            <RefreshControl
              progressViewOffset={Platform.select({ android: topInset })}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          <View className="overflow-hidden gap-2">
            <Item
              title="Push-уведомления"
              right={<Switch value={isGranted} onChange={handleTogglePush} />}
            />

            {isLoading ? (
              <ActivityIndicator />
            ) : isError ? (
              <RetryInline
                text="Не удалось загрузить настройки"
                onRetry={refetch}
                isLoading={isFetching}
                className="py-2"
              />
            ) : (
              asArray(data?.self).map((item) => (
                <Item
                  key={item.kind}
                  title={item.title}
                  right={
                    <Switch
                      value={item.enabled}
                      onChange={() => handleToggle(item.kind, item.enabled)}
                    />
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default AccountNotifications;
