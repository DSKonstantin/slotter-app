import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

// Второй слайд группы "finances" — см.
// assets/images/history/finances/two.webp. Заголовок собран из шаренного
// компонента сторис; иллюстрация ниже — обрезанный оригинал, см.
// assets/images/history/finances/two-illustration.webp.
const FinancesTwo = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Ты знаешь сколько <StoryInlineIcon name="Money_fill" /> заработал
              за прошлый месяц?
            </>
          }
          subtitle="Большинство мастеров отвечают примерно. Финансы покажут точно."
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/finances/two.webp")}
      />
    </StoryScreenLayout>
  );
};

export default FinancesTwo;
