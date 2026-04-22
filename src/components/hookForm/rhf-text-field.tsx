import React, { ReactNode } from "react";
import { TextInputProps } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/src/components/ui";
import type { FieldSize } from "@/src/components/ui/fields/BaseField";

type RHFTextFieldProps = {
  name: string;
  label?: string;
  hideErrorText?: boolean;
  disabled?: boolean;
  size?: FieldSize;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  onEndAdornmentPress?: () => void;
  maskFn?: (value: string) => string;
} & TextInputProps;

export function RhfTextField({
  name,
  label,
  startAdornment,
  endAdornment,
  onEndAdornmentPress,
  hideErrorText,
  size,
  maskFn,
  ...other
}: RHFTextFieldProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Input
          value={value != null ? String(value) : ""}
          onChangeText={(text) => {
            const maskedValue = maskFn ? maskFn(text) : text;
            onChange(maskedValue);
          }}
          label={label}
          error={error}
          hideErrorText={hideErrorText}
          size={size}
          startAdornment={startAdornment}
          endAdornment={endAdornment}
          onEndAdornmentPress={onEndAdornmentPress}
          {...other}
        />
      )}
    />
  );
}
