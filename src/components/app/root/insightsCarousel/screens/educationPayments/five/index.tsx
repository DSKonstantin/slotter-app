import React from "react";
import { View } from "react-native";

import {
  STORY_APP_TABS,
  StoryAppTabsBar,
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

// Пятый слайд группы "education_payments" — см.
// assets/images/history/training/five.webp. Верхний блок (вкладки + заголовок)
// собран из шаренных компонентов сторис; иллюстрация ниже — обрезанный
// оригинал (без панели вкладок и заголовка, они теперь настоящие компоненты) —
// см. assets/images/history/training/five-illustration.webp.
const EducationPaymentsFive = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="gap-4">
        <View className="pl-screen">
          <StoryAppTabsBar tabs={STORY_APP_TABS.slice(3)} activeIndex={0} />
        </View>
        <View className="px-screen">
          <StoryHeading
            title={
              "Уведомления, изменения и другие события в одном месте, не нужны блокноты и таблицы"
            }
            subtitle="Из этого раздела можно сразу подтвердить, перенести или отменить событие"
          />
        </View>
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/training/five.png")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsFive;
