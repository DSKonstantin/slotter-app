import React, { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = { children: ReactNode };

export function TopGradientBar({ children }: Props) {
  const { top } = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={["rgba(0,0,0,0.55)", "transparent"]}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingTop: top + 8,
        paddingBottom: 24,
        paddingHorizontal: 16,
      }}
    >
      {children}
    </LinearGradient>
  );
}
