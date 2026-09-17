import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

const AppUpdateFour = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Настраивайте ваши <StoryInlineIcon name="Send_fill" />
              {"\n"}рассылки проще
            </>
          }
          subtitle="Точнее аудитория, безопаснее отправка, гибче время запуска"
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/app_update/four.webp")}
      />
    </StoryScreenLayout>
  );
};

export default AppUpdateFour;
