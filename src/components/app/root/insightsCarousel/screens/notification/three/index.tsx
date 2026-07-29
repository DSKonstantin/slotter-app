import React from "react";
import { View } from "react-native";

import { Typography } from "@/src/components/ui";
import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

const NotificationThree = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Бесплатные каналы <StoryInlineIcon name="lightning_light" />
            </>
          }
          subtitle={
            <>
              Telegram-бот, Макс-бот и{" "}
              <Typography weight="semibold" className="text-neutral-900">
                приложение Slotter — бесплатно
              </Typography>
              . Уведомления приходят от бота. Клиент должен{" "}
              <Typography weight="semibold" className="text-neutral-900">
                подписаться на бота
              </Typography>{" "}
              или установить приложение.
            </>
          }
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/notification/three.webp")}
      />
    </StoryScreenLayout>
  );
};

export default NotificationThree;
