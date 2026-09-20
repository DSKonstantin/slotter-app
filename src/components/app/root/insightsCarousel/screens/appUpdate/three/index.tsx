import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const AppUpdateThree = () => {
  const { bottom } = useSafeAreaInsets();

  return (
    <StoryScreenLayout
      paddingTop={68}
      className="pb-12"
      style={{ paddingBottom: bottom }}
    >
      <StoryIllustration
        source={require("@/assets/images/history/app_update/three.webp")}
      />
    </StoryScreenLayout>
  );
};

export default AppUpdateThree;
