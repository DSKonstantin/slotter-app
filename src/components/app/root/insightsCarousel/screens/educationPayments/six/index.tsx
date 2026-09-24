import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const EducationPaymentsSix = () => {
  return (
    <StoryScreenLayout paddingTop={48} paddingBottom={8}>
      <StoryIllustration
        source={require("@/assets/images/history/training/six.png")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsSix;
