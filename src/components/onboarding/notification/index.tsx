import React from "react";
import { View } from "react-native";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import { StSvg, Typography } from "@/src/components/ui";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useNotificationPermission } from "@/src/hooks/useNotificationPermission";
import { colors } from "@/src/styles/colors";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";

const Notification = () => {
  const auth = useRequiredAuth();
  const { canAskAgain, requestOrOpenSettings, refresh } =
    useNotificationPermission();

  const [updateUser] = useUpdateUserMutation();

  return (
    <AuthScreenLayout
      header={<AuthHeader />}
      footer={
        <AuthFooter
          primary={{
            title: canAskAgain ? "Разрешить доступ" : "Открыть настройки",
            onPress: async () => {
              if (!auth) return;
              await requestOrOpenSettings();

              const next = await refresh();

              if (next.status === "granted") {
                await updateUser({
                  id: auth.userId,
                  data: { onboarding_step: "link" },
                }).unwrap();
                router.push(Routers.onboarding.link);
              }
            },
          }}
          secondary={{
            title: "Настрою потом",
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
      <View className="flex-1 justify-center items-center mb-14">
        <View className="items-center mb-3">
          <StSvg name="Bell_pin_fill" size={60} color={colors.neutral[900]} />
        </View>

        <Typography weight="semibold" className="text-display text-center">
          Чтобы жить стало проще
        </Typography>
        <Typography className="text-body text-center text-neutral-500 mt-2">
          Разреши нам напоминать о записях, сообщениях и изменениях. Никакого
          спама, честно
        </Typography>
      </View>
    </AuthScreenLayout>
  );
};

export default Notification;
