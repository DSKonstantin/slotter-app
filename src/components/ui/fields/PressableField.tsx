import React, { ReactNode, Ref } from "react";
import { Pressable, Text, View } from "react-native";
import { twMerge } from "tailwind-merge";
import { FieldError } from "react-hook-form";

import { BaseField } from "./BaseField";
import { colors } from "@/src/styles/colors";

type PressableFieldProps = {
  value: string | null;
  placeholder?: string;
  onPress: () => void;
  label?: string;
  error?: FieldError;
  disabled?: boolean;
  hideErrorText?: boolean;
  active?: boolean;
  fieldClassName?: string;
  textClassName?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  onEndAdornmentPress?: () => void;
  ref?: Ref<View>;
};

export function PressableField({
  value,
  placeholder,
  onPress,
  label,
  error,
  disabled,
  hideErrorText,
  active,
  fieldClassName,
  textClassName,
  startAdornment,
  endAdornment,
  onEndAdornmentPress,
  ref,
}: PressableFieldProps) {
  return (
    <BaseField
      ref={ref}
      label={label}
      error={error}
      hideErrorText={hideErrorText}
      disabled={disabled}
      active={active}
      className={fieldClassName}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      onEndAdornmentPress={onEndAdornmentPress}
      renderControl={() => (
        <Pressable
          className="flex-1 justify-center"
          disabled={disabled}
          onPress={onPress}
        >
          <Text
            className={twMerge(
              "font-inter-regular text-[16px] px-4",
              textClassName,
            )}
            numberOfLines={1}
            style={{
              color: value ? colors.neutral[900] : colors.neutral[300],
            }}
          >
            {value ?? placeholder}
          </Text>
        </Pressable>
      )}
    />
  );
}
