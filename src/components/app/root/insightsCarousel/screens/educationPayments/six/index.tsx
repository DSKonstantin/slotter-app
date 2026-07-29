import React from "react";
import { View } from "react-native";

import {
  STORY_APP_TABS,
  StoryAppTabsBar,
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const EducationPaymentsSix = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="gap-4">
        <View className="pl-screen">
          <StoryAppTabsBar tabs={STORY_APP_TABS.slice(4)} activeIndex={0} />
        </View>
        <View className="px-screen">
          <StoryHeading
            title={"Сколько заработал и сколько\nпотратил считается само"}
            subtitle="Видно какие услуги приносят больше и сколько платит каждый клиент"
          />
        </View>
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/training/six.webp")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsSix;
