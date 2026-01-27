import React, { ReactNode, useState } from "react";
import { View, Text } from "react-native";
import { twMerge } from "tailwind-merge";
import { FieldError } from "react-hook-form";

type BaseFieldProps = {
  label?: string;
  hideErrorText?: boolean;
  error?: FieldError;
  disabled?: boolean;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;

  renderControl: (params: {
    disabled?: boolean;
    focused: boolean;
    setFocused: (v: boolean) => void;
  }) => ReactNode;
};

export function BaseField({
  label,
  error,
  disabled,
  startAdornment,
  hideErrorText = false,
  endAdornment,
  renderControl,
}: BaseFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="flex-grow">
      {label && <Text className={styles.label}>{label}</Text>}

      <View
        className={twMerge(
          styles.base,
          focused && styles.focus,
          error && styles.error,
          disabled && styles.disabled,
        )}
      >
        {startAdornment && (
          <View className={styles.adornmentStart}>{startAdornment}</View>
        )}

        {renderControl({ disabled, focused, setFocused })}

        {endAdornment && (
          <View className={styles.adornmentEnd}>{endAdornment}</View>
        )}
      </View>

      {!hideErrorText && (
        <View className={styles.errorContainer}>
          {error && <Text className={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = {
  label: "mb-2 font-inter-medium text-gray text-caption",

  base: "flex-row items-center h-[48px] rounded-small bg-secondary border border-transparent",

  focus: "border-accent",

  error: "border-accent-red",

  disabled: "bg-gray-muted",

  adornmentStart: "mx-2",

  adornmentEnd: "mx-2",

  errorContainer: "min-h-[20px]",
  errorText: "font-inter-medium mt-[2px] text-accent-red text-caption",
};
