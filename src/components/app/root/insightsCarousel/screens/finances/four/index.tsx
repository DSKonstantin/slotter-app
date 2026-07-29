import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

const FinancesFour = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Каждая подтвержденная запись{" "}
              <StoryInlineIcon name="Check_round_fill" /> автоматически идёт в
              доходы
            </>
          }
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/finances/four.webp")}
      />
    </StoryScreenLayout>
  );
};

export default FinancesFour;
