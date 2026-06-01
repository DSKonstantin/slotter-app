import React, { ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import { DatePicker } from "@/src/components/ui";
import { useComposedFieldRef } from "@/src/hooks/useScrollToError";

type DatePickerFieldsProps = {
  name: string;
  label?: string;
  placeholder?: string;
  hideErrorText?: boolean;
  defaultDisplayValue?: Date;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;

  formatValue?: (date: Date) => string | number;
  parseValue?: (value: unknown) => Date | null;
  formatDisplay?: (date: Date) => string;
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
  formatDisplay,
  ...other
}: DatePickerFieldsProps) {
  const { control } = useFormContext();
  const {
    field: { onChange, value, ref },
    fieldState: { error },
  } = useController({ name, control });
  const setRef = useComposedFieldRef(name, ref);

  return (
    <DatePicker
      ref={setRef}
      value={parseValue ? parseValue(value) : value}
      label={label}
      placeholder={placeholder}
      error={error}
      hideErrorText={hideErrorText}
      defaultDisplayValue={defaultDisplayValue}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      formatDisplay={formatDisplay}
      onChange={(d: Date) => {
        onChange(formatValue ? formatValue(d) : d);
      }}
      {...other}
    />
  );
}
