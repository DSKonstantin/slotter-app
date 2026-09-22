import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const AppUpdateFour = () => {
  return (
    <StoryScreenLayout paddingBottom={8}>
      <StoryIllustration
        source={require("@/assets/images/history/app_update/four.webp")}
      />
    </StoryScreenLayout>
  );
};

export default AppUpdateFour;
