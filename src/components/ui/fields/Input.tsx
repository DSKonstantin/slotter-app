import React, { ReactNode, Ref } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { FieldError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { colors } from "@/src/styles/colors";
import { BaseField, FieldSize } from "./BaseField";

type InputProps = {
  label?: string;
  labelRight?: ReactNode;
  error?: FieldError;
  hint?: ReactNode;
  success?: boolean;
  disabled?: boolean;
  hideErrorText?: boolean;
  size?: FieldSize;
  inputClassName?: string;
  ref?: Ref<View>;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  onEndAdornmentPress?: () => void;
} & TextInputProps;

export function Input({
  label,
  labelRight,
  error,
  hint,
  success,
  hideErrorText,
  disabled,
  size = "md",
  inputClassName,
  startAdornment,
  endAdornment,
  onEndAdornmentPress,
  ref,
  ...props
}: InputProps) {
  return (
    <BaseField
      ref={ref}
      label={label}
      labelRight={labelRight}
      error={error}
      hint={hint}
      success={success}
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
          editable={!disabled && (props.editable ?? true)}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={twMerge(inputSizes[size], inputClassName)}
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
