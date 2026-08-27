import React, { useEffect, useRef, useCallback, memo } from "react";
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

function SwitchComponent({
  value,
  onChange,
  disabled = false,
  width = 54,
  height = 28,
  className,
}: SwitchProps) {
  const position = useRef(new Animated.Value(value ? 1 : 0)).current;
  const color = useRef(new Animated.Value(value ? 1 : 0)).current;

  const thumbSize = height - 4;
  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [2, width - thumbSize - 2],
  });

  const bgColor = color.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.background.switch, colors.primary.green[500]],
  });

  const handleToggle = useCallback(() => {
    if (disabled) return;
    onChange(!value);
  }, [disabled, onChange, value]);

  useEffect(() => {
    const toValue = value ? 1 : 0;
    Animated.timing(position, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(color, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [position, color, value]);

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
          className="bg-background-surface shadow-sm"
        />
      </Animated.View>
    </Pressable>
  );
}

export const Switch = memo(SwitchComponent);
