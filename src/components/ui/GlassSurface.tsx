import React from "react";
import { View, type ViewProps } from "react-native";
import { twMerge } from "tailwind-merge";
import {
  GlassView,
  isLiquidGlassAvailable,
  type GlassStyle,
} from "expo-glass-effect";

type GlassSurfaceProps = ViewProps & {
  effect?: GlassStyle;
  interactive?: boolean;
  fallbackClassName?: string;
};

export function GlassSurface({
  effect = "regular",
  interactive = false,
  fallbackClassName,
  className,
  children,
  ...props
}: GlassSurfaceProps) {
  if (!isLiquidGlassAvailable()) {
    return (
      <View className={twMerge(className, fallbackClassName)} {...props}>
        {children}
      </View>
    );
  }

  return (
    <GlassView
      glassEffectStyle={effect}
      isInteractive={interactive}
      colorScheme="light"
      className={className}
      {...props}
    >
      {children}
    </GlassView>
  );
}
