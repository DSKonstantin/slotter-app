import React from "react";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  position: "top" | "bottom";
  height: number;
  color?: string;
};

const BASE_COLOR = "#F2F2F6";

const FadeOverlay = ({ position, height, color = BASE_COLOR }: Props) => (
  <LinearGradient
    colors={[color, `${color}00`]}
    start={{ x: 0, y: position === "top" ? 0 : 1 }}
    end={{ x: 0, y: position === "top" ? 1 : 0 }}
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      [position]: 0,
      height,
    }}
    pointerEvents="none"
  />
);

export { FadeOverlay };
