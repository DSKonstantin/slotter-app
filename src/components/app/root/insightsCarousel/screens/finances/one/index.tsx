import React from "react";
import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const FinancesOne = () => {
  return (
    <StoryScreenLayout paddingTop={48}>
      <StoryIllustration
        source={require("@/assets/images/history/finances/one.png")}
      />
    </StoryScreenLayout>
  );
};

export default FinancesOne;
