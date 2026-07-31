import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  StoryPill,
  StoryPhotoScrimHeading,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

const FinancesOne = () => {
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <Image
        source={require("@/assets/images/history/finances/one.webp")}
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
