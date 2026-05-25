import React from "react";
import { Image, View } from "react-native";

import { StSvg, Typography } from "@/src/components/ui";
import magazine from "@/assets/images/history/magazine.png";
import long_circle from "@/assets/images/history/long_circle.png";
import {LinearGradient} from "expo-linear-gradient";

const ServicesStoryScreen = () => (
  <View style={{ flex: 1 }}>
    <Image
      source={require("@/assets/images/history/services.png")}
      style={{ flex: 1, width: "100%" }}
      resizeMode="stretch"
    />
  </View>
);

export default ServicesStoryScreen;
