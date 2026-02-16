import React, { ReactNode } from "react";
import { TextInputProps } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/src/components/ui";

type RHFTextFieldProps = {
  name: string;
  label?: string;
  hideErrorText?: boolean;
  disabled?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  maskFn?: (value: string) => string;
} & TextInputProps;

export function RhfTextField({
  name,
  label,
  startAdornment,
  endAdornment,
  hideErrorText,
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
          value={value}
          onChangeText={(text) => {
            const maskedValue = maskFn ? maskFn(text) : text;
            onChange(maskedValue);
          }}
          label={label}
          error={error}
          hideErrorText={hideErrorText}
          startAdornment={startAdornment}
          endAdornment={endAdornment}
          {...other}
        />
      )}
    />
  );
}
