import React from "react";
import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const NotificationTwo = () => {
  return (
    <StoryScreenLayout paddingTop={0} paddingBottom={8}>
      <StoryIllustration
        source={require("@/assets/images/history/notification/two.png")}
        contentPosition="top"
      />
    </StoryScreenLayout>
  );
};

export default NotificationTwo;
