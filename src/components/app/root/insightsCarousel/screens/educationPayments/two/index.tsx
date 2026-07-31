import React from "react";
import { View } from "react-native";

import {
  StoryAppTabsBar,
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const EducationPaymentsTwo = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="gap-4">
        <View className="pl-screen">
          <StoryAppTabsBar activeIndex={0} />
        </View>
        <View className="px-screen">
          <StoryHeading
            title={"Заполни профиль один раз и клиенты сразу увидят кто ты"}
            subtitle="А также настраивай параметры бронирования и взаимодействия с клиентами"
          />
        </View>
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/training/two.webp")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsTwo;
