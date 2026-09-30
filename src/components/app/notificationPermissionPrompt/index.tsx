import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Button, StModal } from "@/src/components/ui";
import {
  NOTIFICATION_PERMISSION_ACTIONS,
  NotificationPermissionContent,
} from "@/src/components/shared/notificationPermission";
import { useNotificationPermission } from "@/src/hooks/useNotificationPermission";
import { requestOneSignalPermission } from "@/src/services/oneSignal";
import { useAppSelector } from "@/src/store/redux/store";
import {
  createNotificationPromptState,
  getNotificationPromptMode,
  getNotificationPromptStorageKey,
  markNotificationPromptShown,
  parseNotificationPromptState,
  shouldShowNotificationPrompt,
  type NotificationPromptMode,
} from "@/src/utils/notificationPromptSchedule";

const NotificationPermissionPrompt = () => {
  const [mode, setMode] = useState<NotificationPromptMode | null>(null);

  const checkedUserIdRef = useRef<number | null>(null);

  const userId = useAppSelector((s) => s.auth.user?.id);
  const { refresh, request, openSettings } = useNotificationPermission();

  const handleClose = () => setMode(null);

  const handleAllow = async () => {
    setMode(null);
    const result = await request();
    if (result.status === "granted") {
      requestOneSignalPermission();
    }
  };

  const handleOpenSettings = () => {
    setMode(null);
    openSettings();
  };

  useEffect(() => {
    if (userId == null || checkedUserIdRef.current === userId) return;

    checkedUserIdRef.current = userId;

    const check = async () => {
      const permission = await refresh();
      const nextMode = getNotificationPromptMode(permission);
      if (!nextMode) return;

      const key = getNotificationPromptStorageKey(userId);
      const now = Date.now();
      const stored = parseNotificationPromptState(
        await AsyncStorage.getItem(key),
      );

      if (!stored) {
        await AsyncStorage.setItem(
          key,
          JSON.stringify(createNotificationPromptState(now)),
        );
        return;
      }

      if (!shouldShowNotificationPrompt(nextMode, stored, now)) return;

      await AsyncStorage.setItem(
        key,
        JSON.stringify(markNotificationPromptShown(nextMode, stored, now)),
      );
      setMode(nextMode);
    };

    check().catch(() => {});
  }, [userId, refresh]);

  return (
    <StModal visible={mode !== null} onClose={handleClose}>
      <NotificationPermissionContent className="mt-2 mb-6" />

      <View className="gap-2">
        {mode === "settings" ? (
          <Button
            title={NOTIFICATION_PERMISSION_ACTIONS.openSettings}
            onPress={handleOpenSettings}
          />
        ) : (
          <Button
            title={NOTIFICATION_PERMISSION_ACTIONS.allow}
            onPress={handleAllow}
          />
        )}
        <Button
          variant="clear"
          title={NOTIFICATION_PERMISSION_ACTIONS.later}
          onPress={handleClose}
        />
      </View>
    </StModal>
  );
};

export default NotificationPermissionPrompt;
