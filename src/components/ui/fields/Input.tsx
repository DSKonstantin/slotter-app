import React, { ReactNode } from "react";
import { TextInput, TextInputProps } from "react-native";
import { FieldError } from "react-hook-form";
import { colors } from "@/src/styles/colors";
import { BaseField, FieldSize } from "./BaseField";

type InputProps = {
  label?: string;
  error?: FieldError;
  disabled?: boolean;
  hideErrorText?: boolean;
  size?: FieldSize;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  onEndAdornmentPress?: () => void;
} & TextInputProps;

export function Input({
  label,
  error,
  hideErrorText,
  disabled,
  size = "md",
  startAdornment,
  endAdornment,
  onEndAdornmentPress,
  ...props
}: InputProps) {
  return (
    <BaseField
      label={label}
      error={error}
      hideErrorText={hideErrorText}
      disabled={disabled}
      size={size}
      multiline={props.multiline}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      onEndAdornmentPress={onEndAdornmentPress}
      renderControl={({ setFocused }) => (
        <TextInput
          {...props}
          value={props.value ?? ""}
          editable={!disabled}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={inputSizes[size]}
          placeholderTextColor={colors.neutral[300]}
          textAlignVertical={props.multiline ? "top" : "center"}
          style={props.multiline ? styles.multilineStyle : undefined}
        />
      )}
    />
  );
}

const inputSizes: Record<FieldSize, string> = {
  md: "flex-1 font-inter-regular text-primary text-[16px] px-4 py-2.5",
  sm: "flex-1 font-inter-regular text-primary text-[14px] px-3 py-2",
  xs: "flex-1 font-inter-regular text-primary text-[13px] px-2 py-1",
};

const styles = {
  multilineStyle: { minHeight: 100 },
};
