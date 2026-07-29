import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

const FillProfileFour = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Когда в услуге всё видно <StoryInlineIcon name="Eye_fill" />{" "}
              сразу, клиент нажимает «Записаться» <StoryInlineIcon name="Tab" />{" "}
              сам
            </>
          }
          subtitle="Пишите описания, и не забывайте про фото, они всегда увеличивают процент записи."
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/fill_profile/four.webp")}
      />
    </StoryScreenLayout>
  );
};

export default FillProfileFour;
