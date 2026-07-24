import React from "react";
import { View } from "react-native";

import {
  STORY_APP_TABS,
  StoryAppTabsBar,
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
} from "@/src/components/app/root/insightsCarousel/components";

// Третий слайд группы "education_payments" — см.
// assets/images/history/training/three.webp. Верхний блок (вкладки + заголовок)
// собран из шаренных компонентов сторис; иллюстрация ниже — обрезанный
// оригинал (без панели вкладок и заголовка, они теперь настоящие компоненты) —
// см. assets/images/history/training/three-illustration.webp.
const EducationPaymentsThree = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="gap-4">
        <View className="pl-screen">
          <StoryAppTabsBar tabs={STORY_APP_TABS.slice(1)} activeIndex={0} />
        </View>
        <View className="px-screen">
          <StoryHeading
            title={
              "Настрой рабочие часы. Клиенты сами найдут время и запишутся"
            }
            subtitle="Выбираешь дни и часы вручную, копируешь прошлый месяц или применяешь шаблон"
          />
        </View>
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/training/three.png")}
      />
    </StoryScreenLayout>
  );
};

export default EducationPaymentsThree;
