import React from "react";
import { Image, type ImageSource } from "expo-image";

import { StoryScreenLayout } from "@/src/components/app/root/insightsCarousel/components";

const ImageStoryScreen = ({
  source,
  paddingTop,
}: {
  source: ImageSource;
  paddingTop?: number;
}) => {
  return (
    <StoryScreenLayout paddingTop={paddingTop}>
      <Image
        source={source}
        style={{ flex: 1, width: "100%" }}
        contentFit="cover"
        contentPosition="top"
      />
    </StoryScreenLayout>
  );
};

export default ImageStoryScreen;
