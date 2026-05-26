import React from "react";
import { Text, type TextProps } from "react-native";
import { colors } from "@/src/styles/colors";

type Props = TextProps & {
  text: string;
  highlight: string;
  className?: string;
};

const HighlightText = ({ text, highlight, ...textProps }: Props) => {
  if (!text) return <Text {...textProps}>{text}</Text>;

  const trimmed = highlight?.trim() ?? "";
  const index = trimmed
    ? text.toLowerCase().indexOf(trimmed.toLowerCase())
    : -1;

  if (index === -1) {
    return <Text {...textProps}>{text}</Text>;
  }

  return (
    <Text {...textProps}>
      {text.slice(0, index)}
      <Text style={{ color: colors.primary.blue[500] }}>
        {text.slice(index, index + trimmed.length)}
      </Text>
      {text.slice(index + trimmed.length)}
    </Text>
  );
};

export default HighlightText;
