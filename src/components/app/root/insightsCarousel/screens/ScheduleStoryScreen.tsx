import React from "react";
import { Image, View } from "react-native";

const ScheduleStoryScreen = () => (
  <View style={{ flex: 1 }}>
    <Image
      source={require("@/assets/images/history/account.png")}
      style={{ flex: 1, width: "100%" }}
      resizeMode="stretch"
    />
  </View>
);

export default ScheduleStoryScreen;
