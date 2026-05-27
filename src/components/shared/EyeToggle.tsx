import React from "react";
import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  visible: boolean;
  onPress: () => void;
  size?: number;
};

const EyeToggle = ({ visible, onPress, size = 20 }: Props) => (
  <StSvg
    name={visible ? "View_hide_fill" : "Eye_fill"}
    size={size}
    color={colors.neutral[900]}
    onPress={onPress}
  />
);

export default EyeToggle;
