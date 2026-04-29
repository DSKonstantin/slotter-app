import React, { ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { DatePicker } from "@/src/components/ui";

type DatePickerFieldsProps = {
  name: string;
  label?: string;
  placeholder?: string;
  hideErrorText?: boolean;
  defaultDisplayValue?: Date;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;

  formatValue?: (date: Date) => string;
  parseValue?: (value: string) => Date | null;
};

export function RhfDatePicker({
  name,
  label,
  placeholder,
  startAdornment,
  endAdornment,
  hideErrorText,
  defaultDisplayValue,
  formatValue,
  parseValue,
  ...other
}: DatePickerFieldsProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <DatePicker
          value={parseValue ? parseValue(value) : value}
          label={label}
          placeholder={placeholder}
          error={error}
          hideErrorText={hideErrorText}
          defaultDisplayValue={defaultDisplayValue}
          startAdornment={startAdornment}
          endAdornment={endAdornment}
          onChange={(d: Date) => {
            onChange(formatValue ? formatValue(d) : d);
          }}
          {...other}
        />
      )}
    />
  );
}
