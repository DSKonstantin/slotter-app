import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const FillProfileFour = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <StoryIllustration
        source={require("@/assets/images/history/fill_profile/four.png")}
      />
    </StoryScreenLayout>
  );
};

export default FillProfileFour;
