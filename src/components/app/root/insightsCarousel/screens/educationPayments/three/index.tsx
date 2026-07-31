import React from "react";
import { View } from "react-native";

import {
  STORY_APP_TABS,
  StoryAppTabsBar,
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const EducationPaymentsThree = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="gap-4">
        <View className="pl-screen">
          <StoryAppTabsBar tabs={STORY_APP_TABS.slice(1)} activeIndex={0} />
        </View>
        <View className="px-screen">
          <StoryHeading
            title={
              "Настрой рабочие часы. Клиенты сами найдут время и запишутся"
            }
            subtitle="Выбираешь дни и часы вручную, копируешь прошлый месяц или применяешь шаблон"
          />
        </View>
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/training/three.webp")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsThree;
