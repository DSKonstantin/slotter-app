import React from "react";
import { View } from "react-native";

import {
  StoryAppTabsBar,
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const EducationPaymentsOne = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="gap-4">
        <View className="pl-screen">
          <StoryAppTabsBar />
        </View>
        <View className="px-screen">
          <StoryHeading
            title={"Давай разберемся вместе как тут все устроенно"}
          />
        </View>
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/training/one.webp")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsOne;
