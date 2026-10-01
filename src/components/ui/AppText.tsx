import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  type TextProps,
} from "react-native";
import { cssInterop } from "nativewind";
import { MAX_FONT_SCALE } from "@/src/constants/layout";

export function AppText({ style, maxFontSizeMultiplier, ...props }: TextProps) {
  const { fontScale } = useWindowDimensions();

  const maxScale = maxFontSizeMultiplier ?? MAX_FONT_SCALE;
  const lineHeight =
    Platform.OS === "android" && fontScale > maxScale
      ? StyleSheet.flatten(style)?.lineHeight
      : undefined;

  return (
    <Text
      {...props}
      maxFontSizeMultiplier={maxScale}
      style={
        lineHeight
          ? [style, { lineHeight: (lineHeight * maxScale) / fontScale }]
          : style
      }
    />
  );
}

cssInterop(AppText, { className: "style" });
