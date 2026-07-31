import React from "react";
import { View } from "react-native";

import {
  STORY_APP_TABS,
  StoryAppTabsBar,
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const EducationPaymentsFour = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="gap-4">
        <View className="pl-screen">
          <StoryAppTabsBar tabs={STORY_APP_TABS.slice(2)} activeIndex={0} />
        </View>
        <View className="px-screen">
          <StoryHeading
            title={
              "Клиент открывает твою страницу, выбирает услугу и записывается без уточнений"
            }
            subtitle="Для каждой услуги указываешь название, цену, длительность и фото"
          />
        </View>
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/training/four.webp")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsFour;
