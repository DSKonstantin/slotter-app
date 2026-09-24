import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const FillProfileTwo = () => {
  return (
    <StoryScreenLayout paddingTop={48}>
      <StoryIllustration
        source={require("@/assets/images/history/fill_profile/two.png")}
      />
    </StoryScreenLayout>
  );
};

export default FillProfileTwo;
