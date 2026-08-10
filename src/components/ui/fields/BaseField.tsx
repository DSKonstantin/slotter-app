import React, { ReactNode, Ref, useRef, useCallback } from "react";
import { Animated, View, Text, Pressable } from "react-native";
import { twMerge } from "tailwind-merge";
import { FieldError } from "react-hook-form";
import { colors } from "@/src/styles/colors";

export type FieldSize = "md" | "sm" | "xs";

type BaseFieldProps = {
  label?: string;
  labelRight?: ReactNode;
  hideErrorText?: boolean;
  error?: FieldError;
  hint?: ReactNode;
  success?: boolean;
  disabled?: boolean;
  size?: FieldSize;
  multiline?: boolean;
  className?: string;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  onEndAdornmentPress?: () => void;

  ref?: Ref<View>;

  renderControl: (params: {
    disabled?: boolean;
    focused: boolean;
    setFocused: (v: boolean) => void;
  }) => ReactNode;
};

export function BaseField({
  label,
  labelRight,
  error,
  hint,
  success,
  disabled,
  size = "md",
  multiline,
  className,
  startAdornment,
  hideErrorText = false,
  endAdornment,
  onEndAdornmentPress,
  renderControl,
  ref,
}: BaseFieldProps) {
  const focusedAnim = useRef(new Animated.Value(0)).current;
  const focusedRef = useRef(false);

  const setFocused = useCallback(
    (v: boolean) => {
      focusedRef.current = v;
      focusedAnim.setValue(v ? 1 : 0);
    },
    [focusedAnim],
  );

  const animatedBorderColor = focusedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", colors.primary.blue[500]],
  });

  const overrideBorderColor = error
    ? colors.accent.red[500]
    : success
      ? colors.primary.green[700]
      : undefined;

  return (
    <View ref={ref} collapsable={false} className="flex-grow">
      {(label || labelRight) && (
        <View className="flex-row justify-between items-center mb-2">
          <Text className={styles.label}>{label}</Text>
          {labelRight}
        </View>
      )}

      <Animated.View
        className={twMerge(
          styles.base,
          multiline ? styles.baseTop : styles.baseCenter,
          styles.sizes[size],
          disabled && styles.disabled,
          className,
        )}
        style={[
          { borderColor: animatedBorderColor as unknown as string },
          overrideBorderColor
            ? { borderColor: overrideBorderColor }
            : undefined,
        ]}
      >
        {startAdornment && (
          <View className={styles.adornmentStart}>{startAdornment}</View>
        )}

        {renderControl({ disabled, focused: focusedRef.current, setFocused })}

        {endAdornment &&
          (onEndAdornmentPress ? (
            <Pressable
              onPress={onEndAdornmentPress}
              className={`${styles.adornmentEnd} active:opacity-70`}
            >
              {endAdornment}
            </Pressable>
          ) : (
            <View className={styles.adornmentEnd}>{endAdornment}</View>
          ))}
      </Animated.View>

      {!hideErrorText && (
        <Text className={error ? styles.errorText : styles.hintText}>
          {error?.message ?? hint ?? " "}
        </Text>
      )}
    </View>
  );
}

const styles = {
  label: "font-inter-medium text-neutral-500 text-caption",

  base: "flex-row rounded-small bg-background-surface border border-transparent",
  baseCenter: "items-center",
  baseTop: "items-start",

  sizes: {
    md: "min-h-[48px]",
    sm: "min-h-[38px]",
    xs: "min-h-[30px]",
  },

  disabled: "",

  adornmentStart: "ml-2",

  adornmentEnd: "mr-2",

  errorText:
    "min-h-[20px] font-inter-medium mt-[2px] text-accent-red-500 text-caption",
  hintText:
    "min-h-[20px] font-inter-medium mt-[2px] text-neutral-500 text-caption",
};
