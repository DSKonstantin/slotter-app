import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import chartHomeImage from "@/assets/images/app/chart-home.webp";

const WIDTH = 180;
const ASPECT_RATIO = 1323 / 1189;

export const STATS_ILLUSTRATION_SIZE = {
  width: WIDTH,
  height: WIDTH / ASPECT_RATIO,
};

const StatsIllustration = () => (
  <View pointerEvents="none">
    <Image
      source={chartHomeImage}
      style={STATS_ILLUSTRATION_SIZE}
      contentFit="contain"
      accessible={false}
    />
  </View>
);

export default StatsIllustration;
