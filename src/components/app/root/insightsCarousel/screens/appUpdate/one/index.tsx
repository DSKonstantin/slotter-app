import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import { Typography } from "@/src/components/ui";
import { StoryTopScrimHeading } from "@/src/components/app/root/insightsCarousel/components";

const AppUpdateOne = () => {
  return (
    <View className="flex-1">
      <Image
        source={require("@/assets/images/history/app_update/one.webp")}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      <StoryTopScrimHeading
        title={
          <>
            Slotter стал{" "}
            <Typography
              weight="semibold"
              className="text-[28px] text-primary-green-500"
            >
              проще
            </Typography>
            {"\n"}и{" "}
            <Typography
              weight="semibold"
              className="text-[28px] text-primary-green-500"
            >
              гибче
            </Typography>
          </>
        }
        subtitle="Показываем все что добавили и обновили"
        swipeLabel="Листай"
      />
    </View>
  );
};

export default AppUpdateOne;
