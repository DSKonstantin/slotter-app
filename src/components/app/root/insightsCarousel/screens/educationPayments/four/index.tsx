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
    <StoryScreenLayout paddingTop={40}>
      <StoryIllustration
        source={require("@/assets/images/history/training/four.png")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsFour;
