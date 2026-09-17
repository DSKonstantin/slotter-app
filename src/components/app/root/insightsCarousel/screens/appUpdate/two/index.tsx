import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const AppUpdateTwo = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title="Главная страница стала доступнее и информативнее"
          subtitle="Журнал событий теперь на главной. Историй меньше, а статистика и динамика в отдельном блоке"
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/app_update/two.webp")}
      />
    </StoryScreenLayout>
  );
};

export default AppUpdateTwo;
