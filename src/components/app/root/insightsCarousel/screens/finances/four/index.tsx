import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const FinancesFour = () => {
  return (
    <StoryScreenLayout paddingTop={48}>
      <StoryIllustration
        source={require("@/assets/images/history/finances/four.png")}
      />
    </StoryScreenLayout>
  );
};

export default FinancesFour;
