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
        <Text className={styles.errorText}>{error?.message ?? " "}</Text>
      )}
    </View>
  );
}

const styles = {
  label: "mb-2 font-inter-medium text-neutral-500 text-caption",

  base: "flex-row items-center min-h-[48px] rounded-small bg-background-surface border border-transparent",

  focus: "border-primary-blue-500",

  error: "border-accent-red-500",

  disabled: "",

  adornmentStart: "mx-2",

  adornmentEnd: "mx-2",

  errorText:
    "min-h-[20px] font-inter-medium mt-[2px] text-accent-red-500 text-caption",
};
