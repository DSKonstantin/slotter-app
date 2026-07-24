import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

// Пятый (последний) слайд группы "finances" — см.
// assets/images/history/finances/five.webp. Заголовок собран из шаренного
// компонента сторис; иллюстрация ниже — обрезанный оригинал, см.
// assets/images/history/finances/five-illustration.webp.
const FinancesFive = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Добавь расходы — увидишь чистую прибыль{" "}
              <StoryInlineIcon name="add_ring_fill" />
            </>
          }
          subtitle="Материалы, аренда, инструменты. Внёс один раз — каждый месяц видишь реальную картину"
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/finances/five.png")}
      />
    </StoryScreenLayout>
  );
};

export default FinancesFive;
