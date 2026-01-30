import React from "react";
import { View } from "react-native";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import { StSvg, Typography } from "@/src/components/ui";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useNotificationPermission } from "@/src/hooks/useNotificationPermission";

const Notification = () => {
  const { status, isGranted, canAskAgain, requestOrOpenSettings, refresh } =
    useNotificationPermission();

  return (
    <AuthScreenLayout
      header={<AuthHeader />}
      footer={
        <AuthFooter
          primary={{
            title: canAskAgain ? "Разрешить доступ" : "Открыть настройки",
            onPress: async () => {
              await requestOrOpenSettings();

              const next = await refresh();

              if (next.status === "granted") {
                router.push(Routers.auth.link);
              }
            },
          }}
          secondary={{
            title: "Настрою потом",
            onPress: () => {
              router.push(Routers.auth.link);
            },
          }}
        />
      }
    >
      <View className="flex-1 justify-center items-center mb-14">
        <View className="items-center mb-3">
          <StSvg name="Bell_pin_fill" size={60} color="black" />
        </View>

        <Typography weight="semibold" className="text-display text-center">
          Чтобы жить стало проще
        </Typography>
        <Typography
          weight="medium"
          className="text-body text-center text-gray mt-2"
        >
          Разреши нам напоминать о записях, сообщениях и изменениях. Никакого
          спама, честно
        </Typography>
      </View>
    </AuthScreenLayout>
  );
};

export default Notification;
