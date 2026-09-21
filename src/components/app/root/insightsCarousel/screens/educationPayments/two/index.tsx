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
    <StoryScreenLayout paddingBottom={8}>
      <StoryIllustration
        source={require("@/assets/images/history/training/two.png")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsTwo;
