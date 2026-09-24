import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const FinancesTwo = () => {
  return (
    <StoryScreenLayout paddingTop={48}>
      <StoryIllustration
        source={require("@/assets/images/history/finances/two.png")}
      />
    </StoryScreenLayout>
  );
};

export default FinancesTwo;
