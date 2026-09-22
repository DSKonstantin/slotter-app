import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const EducationPaymentsOne = () => {
  return (
    <StoryScreenLayout paddingTop={48} paddingBottom={8}>
      <StoryIllustration
        source={require("@/assets/images/history/training/one.png")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsOne;
