import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, type ImageSource } from "expo-image";

const TrainingScreen = ({
  source,
  paddingTop,
}: {
  source: ImageSource;
  paddingTop?: number;
}) => {
  const { top } = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        paddingTop: paddingTop !== undefined ? paddingTop + top : undefined,
      }}
    >
      <Image
        source={source}
        style={{ flex: 1, width: "100%" }}
        contentFit="cover"
        contentPosition="top"
      />
    </View>
  );
};

export default TrainingScreen;
