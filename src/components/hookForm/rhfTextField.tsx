import React, { ReactNode } from "react";
import { TextInputProps } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/src/components/ui";

type RHFTextFieldProps = {
  name: string;
  label?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
} & TextInputProps;

export function RHFTextField({
  name,
  label,
  startAdornment,
  endAdornment,
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
          onChangeText={onChange}
          label={label}
          error={error}
          startAdornment={startAdornment}
          endAdornment={endAdornment}
          {...other}
        />
      )}
    />
  );
}
