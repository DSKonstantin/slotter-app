import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const FillProfileOne = () => {
  return (
    <StoryScreenLayout paddingTop={48}>
      <StoryIllustration
        source={require("@/assets/images/history/fill_profile/one.png")}
      />
    </StoryScreenLayout>
  );
};

export default FillProfileOne;
