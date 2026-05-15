import React, { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = { children: ReactNode };

export function BottomGradientBar({ children }: Props) {
  const { bottom } = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={["transparent", "rgba(0,0,0,0.55)"]}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingTop: 24,
        paddingBottom: bottom + 8,
        paddingHorizontal: 16,
      }}
    >
      {children}
    </LinearGradient>
  );
}
