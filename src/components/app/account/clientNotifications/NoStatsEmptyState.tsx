import React from "react";
import { Image, View } from "react-native";
import { Typography } from "@/src/components/ui";

const NoStatsEmptyState = () => (
  <View className="flex-row gap-4 px-screen pt-5">
    <Image
      source={require("@/assets/images/app/notifications-clients.webp")}
      style={{ width: 80, height: 80 }}
      resizeMode="contain"
    />
    <View className="gap-1 flex-1">
      <Typography weight="semibold" className="text-body">
        Уведомления не отправлялись
      </Typography>
      <Typography weight="regular" className="text-body text-neutral-500">
        Подключи каналы и клиенты начнут получать напоминания о записях
      </Typography>
    </View>
  </View>
);

export default NoStatsEmptyState;
