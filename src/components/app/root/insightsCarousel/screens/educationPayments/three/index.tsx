import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const EducationPaymentsThree = () => {
  return (
    <StoryScreenLayout paddingTop={48}>
      <StoryIllustration
        source={require("@/assets/images/history/training/three.png")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsThree;
