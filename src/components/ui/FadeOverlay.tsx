import React from "react";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  position: "top" | "bottom";
  height: number;
};

const BASE_COLOR = "#F2F2F6";
const TRANSPARENT_COLOR = "rgba(242, 242, 246, 0)";

const FadeOverlay = ({ position, height }: Props) => (
  <LinearGradient
    colors={[BASE_COLOR, TRANSPARENT_COLOR]}
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
