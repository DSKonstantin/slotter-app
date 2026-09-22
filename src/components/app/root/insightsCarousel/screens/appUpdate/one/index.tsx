import React from "react";
import {
  StoryIllustration,
  StoryScreenLayout,
} from "@/src/components/app/root/insightsCarousel/components";

const AppUpdateOne = () => {
  return (
    <StoryScreenLayout paddingBottom={8}>
      <StoryIllustration
        source={require("@/assets/images/history/app_update/one.webp")}
      />
    </StoryScreenLayout>
  );
};

export default AppUpdateOne;
