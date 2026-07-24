import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryInlineIcon,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

// Третий слайд группы "finances" — см.
// assets/images/history/finances/three.webp. Заголовок собран из шаренного
// компонента сторис; иллюстрация ниже — обрезанный оригинал, см.
// assets/images/history/finances/three-illustration.webp.
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
        source={require("@/assets/images/history/finances/three.png")}
      />
    </StoryScreenLayout>
  );
};

export default FinancesThree;
