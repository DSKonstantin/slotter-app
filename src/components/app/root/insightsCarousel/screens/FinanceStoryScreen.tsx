import React from "react";
import { Image, View } from "react-native";

import { Typography } from "@/src/components/ui";
import services from "@/assets/images/history/services.png";
import {LinearGradient} from "expo-linear-gradient";

const FinanceStoryScreen = () => (
  <View style={{ flex: 1 }}>
    <Image
      source={require("@/assets/images/history/schedule.png")}
      style={{ flex: 1, width: "100%" }}
      resizeMode="stretch"
    />
  </View>
);

export default FinanceStoryScreen;
