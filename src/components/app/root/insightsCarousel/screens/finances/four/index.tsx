import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

// Четвёртый слайд группы "finances" — см.
// assets/images/history/finances/four.webp. Заголовок собран из шаренного
// компонента сторис; иллюстрация ниже — обрезанный оригинал, см.
// assets/images/history/finances/four-illustration.webp.
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
        source={require("@/assets/images/history/finances/four.png")}
      />
    </StoryScreenLayout>
  );
};

export default FinancesFour;
