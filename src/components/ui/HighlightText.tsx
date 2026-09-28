import React from "react";
import { type TextProps } from "react-native";
import { AppText } from "@/src/components/ui/AppText";
import { MAX_FONT_SCALE } from "@/src/constants/layout";
import { colors } from "@/src/styles/colors";

type Props = TextProps & {
  text: string;
  highlight: string;
  className?: string;
};

const HighlightText = ({ text, highlight, ...textProps }: Props) => {
  if (!text)
    return (
      <AppText maxFontSizeMultiplier={MAX_FONT_SCALE} {...textProps}>
        {text}
      </AppText>
    );

  const trimmed = highlight?.trim() ?? "";
  const index = trimmed
    ? text.toLowerCase().indexOf(trimmed.toLowerCase())
    : -1;

  if (index === -1) {
    return (
      <AppText maxFontSizeMultiplier={MAX_FONT_SCALE} {...textProps}>
        {text}
      </AppText>
    );
  }

  return (
    <AppText maxFontSizeMultiplier={MAX_FONT_SCALE} {...textProps}>
      {text.slice(0, index)}
      <AppText
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        style={{ color: colors.primary.blue[500] }}
      >
        {text.slice(index, index + trimmed.length)}
      </AppText>
      {text.slice(index + trimmed.length)}
    </AppText>
  );
};

export default HighlightText;
