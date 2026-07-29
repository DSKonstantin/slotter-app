import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  StoryPill,
  StoryPhotoScrimHeading,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

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
