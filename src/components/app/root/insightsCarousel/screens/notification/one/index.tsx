import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  StoryPill,
  StoryPhotoScrimHeading,
} from "@/src/components/app/root/insightsCarousel/components";

const NotificationOne = () => {
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <Image
        source={require("@/assets/images/history/notification/one.webp")}
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
