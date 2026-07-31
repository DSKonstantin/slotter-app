import React from "react";
import { View } from "react-native";

import { Typography } from "@/src/components/ui";
import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

const NotificationTwo = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Зачем уведомлять{"\n"}клиентов?{" "}
              <StoryInlineIcon name="User_fill" />
            </>
          }
          subtitle={
            <>
              Клиент получает{" "}
              <Typography weight="semibold" className="text-neutral-900">
                подтверждение записи, напоминание о визите
              </Typography>{" "}
              и сигнал при переносе или отмене.{" "}
              <Typography weight="semibold" className="text-neutral-900">
                Меньше «забыл» — меньше
              </Typography>{" "}
              пустых окон в расписании.
            </>
          }
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/notification/two.webp")}
      />
    </StoryScreenLayout>
  );
};

export default NotificationTwo;
