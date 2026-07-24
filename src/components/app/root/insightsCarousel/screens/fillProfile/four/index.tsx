import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

// Четвёртый (последний) слайд группы "fill_profile" — см.
// assets/images/history/fill_profile/four.webp. Заголовок собран из
// шаренного компонента сторис; иллюстрация ниже — обрезанный оригинал, см.
// assets/images/history/fill_profile/four-illustration.webp.
const FillProfileFour = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Когда в услуге всё видно <StoryInlineIcon name="Eye_fill" />{" "}
              сразу, клиент нажимает «Записаться»{" "}
              <StoryInlineIcon name="Tab" /> сам
            </>
          }
          subtitle="Пишите описания, и не забывайте про фото, они всегда увеличивают процент записи."
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/fill_profile/four.webp")}
      />
    </StoryScreenLayout>
  );
};

export default FillProfileFour;
