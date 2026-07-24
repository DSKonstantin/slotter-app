import React from "react";
import { View } from "react-native";

import {
  STORY_APP_TABS,
  StoryAppTabsBar,
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

// Четвёртый слайд группы "education_payments" — см.
// assets/images/history/training/four.webp. Верхний блок (вкладки + заголовок)
// собран из шаренных компонентов сторис; иллюстрация ниже — обрезанный
// оригинал (без панели вкладок и заголовка, они теперь настоящие компоненты) —
// см. assets/images/history/training/four-illustration.webp.
const EducationPaymentsFour = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="gap-4">
        <View className="pl-screen">
          <StoryAppTabsBar tabs={STORY_APP_TABS.slice(2)} activeIndex={0} />
        </View>
        <View className="px-screen">
          <StoryHeading
            title={
              "Клиент открывает твою страницу, выбирает услугу и записывается без уточнений"
            }
            subtitle="Для каждой услуги указываешь название, цену, длительность и фото"
          />
        </View>
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/training/four.png")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsFour;
