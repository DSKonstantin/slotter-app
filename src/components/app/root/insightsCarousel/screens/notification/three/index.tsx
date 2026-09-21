import React from "react";
import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const NotificationThree = () => {
  return (
    <StoryScreenLayout paddingTop={0} paddingBottom={8}>
      <StoryIllustration
        source={require("@/assets/images/history/notification/three.png")}
      />
    </StoryScreenLayout>
  );
};

export default NotificationThree;
