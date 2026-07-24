import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  StoryPill,
  StoryPhotoScrimHeading,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

// Первый слайд группы "fill_profile" — см.
// assets/images/history/fill_profile/one.webp. В отличие от остальных
// экранов сторис тут фото на весь экран, а не боксом — бейдж и заголовок
// раньше были запечены прямо в картинку, теперь это StoryPill и
// StoryPhotoScrimHeading поверх обрезанного фото (см.
// assets/images/history/fill_profile/one-illustration.webp — вырезаны
// верхняя и нижняя полосы, где раньше был текст).
const FillProfileOne = () => {
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <Image
        source={require("@/assets/images/history/fill_profile/one.webp")}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      <View className="px-screen" style={{ paddingTop: top + 68 }}>
        <StoryPill
          label="туториал по системе"
          active
          textClassName="text-primary-green-700"
        />
      </View>

      <StoryPhotoScrimHeading
        title={
          <>
            Почему важно заполнять{" "}
            <StoryInlineIcon size="large" name="User_fill" />{" "}
            <StoryInlineIcon size="large" name="Desk_alt_fill" />
            {"\n"}профиль и услуги
          </>
        }
        gradientHeight={280}
        showSwipeArrow
      />
    </View>
  );
};

export default FillProfileOne;
