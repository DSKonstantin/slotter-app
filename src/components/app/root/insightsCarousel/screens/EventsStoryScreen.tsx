import React from "react";
import { Image, View } from "react-native";

const EventsStoryScreen = () => (
  <View style={{ flex: 1 }}>
    <Image
      source={require("@/assets/images/history/finance.png")}
      style={{ flex: 1, width: "100%" }}
      resizeMode="stretch"
    />
  </View>
);

export default EventsStoryScreen;
