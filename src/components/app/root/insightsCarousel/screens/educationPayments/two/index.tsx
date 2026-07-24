import React from "react";
import { View } from "react-native";

import {
  StoryAppTabsBar,
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

// Второй слайд группы "education_payments" — см.
// assets/images/history/training/two.webp. Верхний блок (вкладки + заголовок)
// собран из шаренных компонентов сторис; иллюстрация ниже — обрезанный
// оригинал (без панели вкладок и заголовка, они теперь настоящие компоненты) —
// см. assets/images/history/training/two-illustration.webp.
const EducationPaymentsTwo = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="gap-4">
        <View className="pl-screen">
          <StoryAppTabsBar activeIndex={0} />
        </View>
        <View className="px-screen">
          <StoryHeading
            title={"Заполни профиль один раз и клиенты сразу увидят кто ты"}
            subtitle="А также настраивай параметры бронирования и взаимодействия с клиентами"
          />
        </View>
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/training/two.webp")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsTwo;
