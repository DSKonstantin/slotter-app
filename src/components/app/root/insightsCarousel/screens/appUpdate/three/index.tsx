import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

const AppUpdateThree = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Прилипание времени <StoryInlineIcon name="Time_fill" />
              {"\n"}и создание пустого слота
            </>
          }
          subtitle="Заполняйте график плотнее — и оставляйте себе время на паузы"
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/app_update/three.webp")}
      />
    </StoryScreenLayout>
  );
};

export default AppUpdateThree;
