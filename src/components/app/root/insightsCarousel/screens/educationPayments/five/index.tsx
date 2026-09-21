import React from "react";
import { View } from "react-native";

import {
  STORY_APP_TABS,
  StoryAppTabsBar,
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const EducationPaymentsFive = () => {
  return (
    <StoryScreenLayout paddingTop={68} paddingBottom={8}>
      <StoryIllustration
        source={require("@/assets/images/history/training/five.png")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsFive;
