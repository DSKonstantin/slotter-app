import React from "react";
import { View } from "react-native";
import { Image, type ImageSource } from "expo-image";

const TrainingScreen = ({ source }: { source: ImageSource }) => (
  <View className="flex-1">
    <Image
      source={source}
      style={{ flex: 1, width: "100%" }}
      contentFit="fill"
    />
  </View>
);

export default TrainingScreen;
