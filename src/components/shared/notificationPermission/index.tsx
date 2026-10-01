import React from "react";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";

import { Typography } from "@/src/components/ui";
import BellPinActiveIcon from "@/src/components/app/root/homeHeader/BellPinActiveIcon";

export const NOTIFICATION_PERMISSION_ACTIONS = {
  allow: "Разрешить доступ",
  openSettings: "Открыть настройки",
  later: "Настрою потом",
};

type NotificationPermissionContentProps = {
  className?: string;
};

export const NotificationPermissionContent = ({
  className,
}: NotificationPermissionContentProps) => (
  <View className={twMerge("items-center", className)}>
    <View className="items-center mb-3">
      <BellPinActiveIcon size={60} />
    </View>

    <Typography weight="semibold" className="text-display text-center">
      Чтобы жить стало проще
    </Typography>
    <Typography className="text-body text-center text-neutral-500 mt-2">
      Разреши нам напоминать о записях, сообщениях и изменениях. Никакого спама,
      честно
    </Typography>
  </View>
);
