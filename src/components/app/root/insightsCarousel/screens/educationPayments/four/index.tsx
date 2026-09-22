import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const EducationPaymentsFour = () => {
  return (
    <StoryScreenLayout paddingTop={48}>
      <StoryIllustration
        source={require("@/assets/images/history/training/four.png")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsFour;
