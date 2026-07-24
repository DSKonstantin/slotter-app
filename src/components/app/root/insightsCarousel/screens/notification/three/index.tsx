import React from "react";
import { View } from "react-native";

import { Typography } from "@/src/components/ui";
import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

// Третий слайд группы "notification" — см.
// assets/images/history/notification/three.webp. ⚡ в заголовке заменена на
// gift_alt_fill (иконки-молнии в иконсете нет — gift ближе всего по смыслу
// к "бесплатно"). Иллюстрация ниже — обрезанный оригинал, см.
// assets/images/history/notification/three-illustration.webp.
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
