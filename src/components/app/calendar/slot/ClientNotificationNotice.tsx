import React from "react";
import { Pressable } from "react-native";
import { router } from "expo-router";

import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useClientNotificationsConnected } from "@/src/hooks/useClientNotificationsConnected";

const ClientNotificationNotice: React.FC = () => {
  const { connected, isLoading } = useClientNotificationsConnected();

  if (connected || isLoading) return null;

  return (
    <Pressable
      onPress={() => router.push(Routers.app.account.clientNotifications.root)}
      className="flex-row items-start gap-3 rounded-base bg-background-yellow p-4 active:opacity-70"
    >
      <StSvg name="Info_alt" size={24} color={colors.accent.orange[500]} />
      <Typography
        weight="regular"
        className="text-body text-neutral-900 flex-1"
      >
        Клиенту не отправили уведомление о записи. Для связи с клиентом
        используйте раздел «Уведомление клиентам».
      </Typography>
    </Pressable>
  );
};

export default ClientNotificationNotice;
