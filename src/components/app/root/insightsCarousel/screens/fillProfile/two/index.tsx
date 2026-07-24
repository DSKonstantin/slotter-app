import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

// Второй слайд группы "fill_profile" — см.
// assets/images/history/fill_profile/two.webp. Заголовок собран из шаренного
// компонента сторис (тут нет панели вкладок, в отличие от education_payments —
// это мокап клиентской страницы записи, а не меню мастера); иллюстрация ниже —
// обрезанный оригинал, см. assets/images/history/fill_profile/two-illustration.webp.
const FillProfileTwo = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Твой профиль и профиль услуги работает{" "}
              <StoryInlineIcon name="Money_fill" /> за тебя
            </>
          }
          subtitle="В двух слайдах расскажем почему важно заполнять профиль"
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/fill_profile/two.png")}
      />
    </StoryScreenLayout>
  );
};

export default FillProfileTwo;
