import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

const FillProfileTwo = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Твой профиль и профиль услуги работает{" "}
              <StoryInlineIcon name="Money_fill" /> за тебя
            </>
          }
          subtitle="В двух слайдах расскажем почему важно заполнять профиль"
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/fill_profile/two.webp")}
      />
    </StoryScreenLayout>
  );
};

export default FillProfileTwo;
