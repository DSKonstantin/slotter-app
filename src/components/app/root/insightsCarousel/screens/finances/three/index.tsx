import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryInlineIcon,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

const FinancesThree = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Полный день, всё занято.{" "}
              <StoryInlineIcon name="close_ring_fill" /> А сколько осталось
              после расходов — непонятно <StoryInlineIcon name="Info" />
            </>
          }
          subtitle="Выручка и прибыль — разные числа. Разницу съедают расходы которые никто не считает"
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/finances/three.webp")}
      />
    </StoryScreenLayout>
  );
};

export default FinancesThree;
