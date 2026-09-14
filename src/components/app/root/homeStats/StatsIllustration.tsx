import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import chartHomeImage from "@/assets/images/app/chart-home.webp";

const WIDTH = 120;
const ASPECT_RATIO = 1323 / 1189;

const StatsIllustration = () => (
  <View pointerEvents="none">
    <Image
      source={chartHomeImage}
      style={{ width: WIDTH, height: WIDTH / ASPECT_RATIO }}
      contentFit="contain"
      accessible={false}
    />
  </View>
);

export default StatsIllustration;
