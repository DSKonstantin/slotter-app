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
    <StoryScreenLayout paddingTop={40}>
      <StoryIllustration
        source={require("@/assets/images/history/training/three.png")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsThree;
