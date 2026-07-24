import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  StoryPill,
  StoryPhotoScrimHeading,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

// Первый слайд группы "finances" — см.
// assets/images/history/finances/one.webp. Фото на весь экран, как в
// fillProfile/one — бейдж и заголовок раньше были запечены прямо в картинку,
// теперь это StoryPill и StoryPhotoScrimHeading поверх обрезанного фото (см.
// assets/images/history/finances/one-illustration.webp — вырезаны верхняя и
// нижняя полосы, где раньше был текст и стрелка-подсказка).
const FinancesOne = () => {
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <Image
        source={require("@/assets/images/history/finances/one.png")}
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
            Начинаем <StoryInlineIcon name="Chart_alt_fill" size="large" />{" "}
            <StoryInlineIcon name="Camera" size="large" />
            {"\n"}считать деньги
          </>
        }
        gradientHeight={220}
        showSwipeArrow
      />
    </View>
  );
};

export default FinancesOne;
