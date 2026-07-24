import React from "react";
import { View } from "react-native";

import {
  StoryAppTabsBar,
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

// Первый слайд группы "education_payments" — см.
// assets/images/history/training/one.webp. Верхний блок (вкладки + заголовок)
// собран из шаренных компонентов сторис; иллюстрация ниже — обрезанный
// оригинал (без панели вкладок и заголовка, они теперь настоящие компоненты) —
// см. assets/images/history/training/one-illustration.webp.
const EducationPaymentsOne = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="gap-4">
        <View className="pl-screen">
          <StoryAppTabsBar />
        </View>
        <View className="px-screen">
          <StoryHeading
            title={"Давай разберемся вместе как тут все устроенно"}
          />
        </View>
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/training/one.webp")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsOne;
