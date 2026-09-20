import React from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";

import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import type { CustomerNotificationState } from "@/src/store/redux/services/api-types";

const WARNING_TEXT =
  "Клиенту не отправили уведомление о записи. Для связи с клиентом используйте раздел «Уведомление клиентам».";
const SENDING_TEXT = "Отправляем уведомление клиенту.";

type Props = {
  state: CustomerNotificationState | null | undefined;
  hasCustomer: boolean;
};

const ClientNotificationNotice: React.FC<Props> = ({ state, hasCustomer }) => {
  if (!hasCustomer || state == null || state === "delivered") return null;

  if (state === "sending") {
    return (
      <View className="flex-row items-start gap-3 rounded-base bg-neutral-100 p-4">
        <StSvg name="Send_fill" size={24} color={colors.neutral[500]} />
        <Typography
          weight="regular"
          className="text-body text-neutral-500 flex-1"
        >
          {SENDING_TEXT}
        </Typography>
      </View>
    );
  }

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
        {WARNING_TEXT}
      </Typography>
    </Pressable>
  );
};

export default ClientNotificationNotice;
