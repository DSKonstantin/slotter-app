import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const AppUpdateTwo = () => {
  return (
    <StoryScreenLayout paddingTop={60} paddingBottom={8}>
      <StoryIllustration
        source={require("@/assets/images/history/app_update/two.webp")}
      />
    </StoryScreenLayout>
  );
};

export default AppUpdateTwo;
