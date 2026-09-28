import React, { ReactNode, useCallback, useRef } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { twMerge } from "tailwind-merge";
import { colors } from "@/src/styles/colors";

export const ITEM_HEIGHT = 40;
export const VISIBLE_ITEMS = 5;
export const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SELECTED_TOP = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;
const FADE_HEIGHT = ITEM_HEIGHT * 2;
const FADE_COLOR = colors.background.DEFAULT;
const HAPTIC_THROTTLE_MS = 30;

export const useWheelHaptics = () => {
  const lastHapticRef = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - lastHapticRef.current < HAPTIC_THROTTLE_MS) return;
    lastHapticRef.current = now;
    void Haptics.selectionAsync();
  }, []);
};

type WheelFrameProps = {
  width: number;
  className?: string;
  children: ReactNode;
};

export const WheelFrame = ({ width, className, children }: WheelFrameProps) => (
  <View
    style={{ height: PICKER_HEIGHT, width }}
    className={twMerge("self-center", className)}
  >
    <View
      pointerEvents="none"
      className="absolute left-0 right-0 rounded-base bg-neutral-100/70"
      style={{ top: SELECTED_TOP, height: ITEM_HEIGHT }}
    />
    {children}
    <View
      pointerEvents="none"
      className="absolute top-0 left-0 right-0"
      style={{ height: FADE_HEIGHT }}
    >
      <LinearGradient
        colors={[FADE_COLOR, `${FADE_COLOR}00`]}
        style={{ flex: 1 }}
      />
    </View>
    <View
      pointerEvents="none"
      className="absolute bottom-0 left-0 right-0"
      style={{ height: FADE_HEIGHT }}
    >
      <LinearGradient
        colors={[`${FADE_COLOR}00`, FADE_COLOR]}
        style={{ flex: 1 }}
      />
    </View>
  </View>
);
