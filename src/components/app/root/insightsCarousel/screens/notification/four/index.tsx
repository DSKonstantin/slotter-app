import React from "react";
import { View } from "react-native";

import { Typography } from "@/src/components/ui";
import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

const NotificationFour = () => {
  return (
    <StoryScreenLayout paddingTop={60}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Прямые уведомления <StoryInlineIcon name="Money_fill" />
            </>
          }
          subtitle={
            <>
              Telegram, Макс или WhatsApp — сообщение{" "}
              <Typography weight="semibold" className="text-neutral-900">
                приходит от вашего имени
              </Typography>
              , а не от бота. Клиенту ничего устанавливать не нужно.{" "}
              <Typography weight="semibold" className="text-neutral-900">
                Охват — 100% базы
              </Typography>
              . От 1 000 ₽/мес.
            </>
          }
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/notification/four.webp")}
      />
    </StoryScreenLayout>
  );
};

export default NotificationFour;
