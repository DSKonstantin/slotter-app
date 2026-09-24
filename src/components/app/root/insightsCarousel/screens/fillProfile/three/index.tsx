import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const FillProfileThree = () => {
  return (
    <StoryScreenLayout paddingTop={48}>
      <StoryIllustration
        source={require("@/assets/images/history/fill_profile/three.png")}
      />
    </StoryScreenLayout>
  );
};

export default FillProfileThree;
