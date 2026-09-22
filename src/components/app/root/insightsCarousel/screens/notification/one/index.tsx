import React from "react";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const NotificationOne = () => {
  return (
    <StoryScreenLayout paddingBottom={8}>
      <StoryIllustration
        source={require("@/assets/images/history/notification/one.png")}
      />
    </StoryScreenLayout>
  );
};

export default NotificationOne;
