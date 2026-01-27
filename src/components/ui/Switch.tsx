import React, { useEffect, useMemo, useRef } from "react";
import { Pressable, Animated, ViewStyle } from "react-native";
import { colors } from "@/src/styles/colors";
import { twMerge } from "tailwind-merge";

type SwitchProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;

  width?: number;
  height?: number;

  className?: string;
};

export function Switch({
  value,
  onChange,
  disabled = false,
  width = 50,
  height = 28,
  className,
}: SwitchProps) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const thumbSize = useMemo(() => height - 4, [height]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, width - thumbSize - 6],
  });

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.background.switch, colors.accent.slotterGreen],
  });

  const handleToggle = () => {
    if (disabled) return;
    onChange(!value);
  };

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [anim, value]);

  return (
    <Pressable
      onPress={handleToggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      className={twMerge(disabled ? "opacity-50" : "opacity-100", className)}
    >
      <Animated.View
        style={[
          {
            width,
            height,
            borderRadius: height / 2,
            backgroundColor: bgColor as any,
            paddingHorizontal: 3,
            justifyContent: "center",
          } satisfies ViewStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              transform: [{ translateX }],
            },
          ]}
          className="bg-secondary shadow-sm"
        />
      </Animated.View>
    </Pressable>
  );
}
