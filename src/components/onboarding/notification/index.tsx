import React from "react";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import {
  NOTIFICATION_PERMISSION_ACTIONS,
  NotificationPermissionContent,
} from "@/src/components/shared/notificationPermission";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useNotificationPermission } from "@/src/hooks/useNotificationPermission";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import { requestOneSignalPermission } from "@/src/services/oneSignal";

const Notification = () => {
  const auth = useRequiredAuth();
  const { canAskAgain, requestOrOpenSettings, refresh } =
    useNotificationPermission();

  const [updateUser] = useUpdateUserMutation();

  return (
    <AuthScreenLayout
      header={<AuthHeader showLogout />}
      footer={
        <AuthFooter
          primary={{
            title: canAskAgain
              ? NOTIFICATION_PERMISSION_ACTIONS.allow
              : NOTIFICATION_PERMISSION_ACTIONS.openSettings,
            onPress: async () => {
              if (!auth) return;
              await requestOrOpenSettings();

              const next = await refresh();

              if (next.status === "granted") {
                requestOneSignalPermission();
                await updateUser({
                  id: auth.userId,
                  data: { onboarding_step: "link" },
                }).unwrap();
                router.push(Routers.onboarding.link);
              }
            },
          }}
          secondary={{
            title: NOTIFICATION_PERMISSION_ACTIONS.later,
            variant: "clear",
            onPress: async () => {
              if (!auth) return;
              await updateUser({
                id: auth.userId,
                data: { onboarding_step: "link" },
              }).unwrap();
              router.push(Routers.onboarding.link);
            },
          }}
        />
      }
    >
      <NotificationPermissionContent className="flex-1 justify-center mb-14" />
    </AuthScreenLayout>
  );
};

export default Notification;
