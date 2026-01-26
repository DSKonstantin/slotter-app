import React, { ReactNode } from "react";
import { TextInput, TextInputProps } from "react-native";
import { FieldError } from "react-hook-form";
import { colors } from "@/src/styles/colors";
import { BaseField } from "./BaseField";

type InputProps = {
  label?: string;
  error?: FieldError;
  disabled?: boolean;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
} & TextInputProps;

export function Input({
  label,
  error,
  disabled,
  startAdornment,
  endAdornment,
  ...props
}: InputProps) {
  return (
    <BaseField
      label={label}
      error={error}
      disabled={disabled}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
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
          className={styles.input}
          placeholderTextColor={colors.gray.muted}
        />
      )}
    />
  );
}

const styles = {
  input: "flex-1 font-inter-regular text-primary text-[16px] px-4",
};
