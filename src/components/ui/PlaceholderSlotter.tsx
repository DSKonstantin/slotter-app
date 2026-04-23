import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

type PlaceholderSlotterProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function PlaceholderSlotter({
  size = 80,
  style,
}: PlaceholderSlotterProps) {
  return (
    <Image
      source={require("@/assets/images/placeholder-slotter.png")}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
