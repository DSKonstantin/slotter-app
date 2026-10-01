import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { Button, StModal } from "@/src/components/ui";
import {
  NOTIFICATION_PERMISSION_ACTIONS,
  NotificationPermissionContent,
} from "@/src/components/shared/notificationPermission";
import { useNotificationPermission } from "@/src/hooks/useNotificationPermission";
import { requestOneSignalPermission } from "@/src/services/oneSignal";
import { useAppSelector } from "@/src/store/redux/store";
import type { NotificationPromptMode } from "@/src/utils/notificationPromptSchedule";
import { takeDueNotificationPromptMode } from "@/src/utils/notificationPromptStorage";

const MODAL_HANDOFF_MS = 800;

const NotificationPermissionPrompt = () => {
  const [mode, setMode] = useState<NotificationPromptMode>("ask");
  const [visible, setVisible] = useState(false);

  const checkedUserIdRef = useRef<number | null>(null);

  const userId = useAppSelector((s) => s.auth.user?.id);
  const updateStatus = useAppSelector((s) => s.appVersion.updateStatus);
  const updateDismissed = useAppSelector((s) => s.appVersion.updateDismissed);
  const { refresh, request, openSettings } = useNotificationPermission();

  const isSettings = mode === "settings";
  const isUpdateBlocking =
    updateStatus === "red" || (updateStatus === "yellow" && !updateDismissed);

  const handleClose = () => setVisible(false);

  const handleAction = async () => {
    setVisible(false);
    if (isSettings) {
      openSettings();
      return;
    }
    const result = await request();
    if (result.status === "granted") {
      requestOneSignalPermission();
    }
  };

  useEffect(() => {
    if (userId == null || isUpdateBlocking) return;
    if (checkedUserIdRef.current === userId) return;

    checkedUserIdRef.current = userId;

    const check = async () => {
      const permission = await refresh();
      const nextMode = await takeDueNotificationPromptMode(userId, permission);
      if (!nextMode) return;

      if (updateStatus === "yellow") {
        await new Promise((resolve) => setTimeout(resolve, MODAL_HANDOFF_MS));
      }
      setMode(nextMode);
      setVisible(true);
    };

    check().catch(() => {});
  }, [userId, isUpdateBlocking, updateStatus, refresh]);

  return (
    <StModal visible={visible} onClose={handleClose}>
      <NotificationPermissionContent className="mt-2 mb-6" />

      <View className="gap-2">
        <Button
          title={
            isSettings
              ? NOTIFICATION_PERMISSION_ACTIONS.openSettings
              : NOTIFICATION_PERMISSION_ACTIONS.allow
          }
          onPress={handleAction}
        />
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
