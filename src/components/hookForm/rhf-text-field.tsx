import React, { ReactNode } from "react";
import { TextInputProps } from "react-native";
import { useController, useFormContext } from "react-hook-form";
import { Input } from "@/src/components/ui";
import type { FieldSize } from "@/src/components/ui/fields/BaseField";
import { useComposedFieldRef } from "@/src/hooks/useScrollToError";

type RHFTextFieldProps = {
  name: string;
  label?: string;
  labelRight?: ReactNode;
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
  labelRight,
  startAdornment,
  endAdornment,
  onEndAdornmentPress,
  hideErrorText,
  size,
  maskFn,
  ...other
}: RHFTextFieldProps) {
  const { control } = useFormContext();
  const {
    field: { onChange, value, ref },
    fieldState: { error },
  } = useController({ name, control });
  const setRef = useComposedFieldRef(name, ref);

  return (
    <Input
      ref={setRef}
      value={value != null ? String(value) : ""}
      onChangeText={(text) => {
        const maskedValue = maskFn ? maskFn(text) : text;
        onChange(maskedValue);
      }}
      label={label}
      labelRight={labelRight}
      error={error}
      hideErrorText={hideErrorText}
      size={size}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      onEndAdornmentPress={onEndAdornmentPress}
      {...other}
    />
  );
}
