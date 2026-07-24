import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  StoryPill,
  StoryPhotoScrimHeading,
} from "@/src/components/app/root/insightsCarousel/components";

// Первый слайд группы "notification" — см.
// assets/images/history/notification/one.webp. Фото на весь экран, как в
// fillProfile/one — бейдж и заголовок раньше были запечены прямо в картинку,
// теперь это StoryPill и StoryPhotoScrimHeading поверх обрезанного фото (см.
// assets/images/history/notification/one-illustration.webp — вырезаны
// верхняя и нижняя полосы, где раньше был текст и стрелка-подсказка).
// Заголовок тут длиннее (5 строк), поэтому у градиента больше высота, чтобы
// весь текст оставался на тёмной подложке.
const NotificationOne = () => {
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <Image
        source={require("@/assets/images/history/notification/one.png")}
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
          "Разберем как отправлять\nуведомление клиентам о\nсостоянии записи"
        }
        gradientHeight={460}
        showSwipeArrow
      />
    </View>
  );
};

export default NotificationOne;
