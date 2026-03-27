import React, { ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { CalendarDatePicker } from "@/src/components/ui/fields/CalendarDatePicker";

type RhfCalendarDatePickerProps = {
  name: string;
  label?: string;
  placeholder?: string;
  displayFormat?: (isoDate: string) => string;
  hideErrorText?: boolean;
  disabled?: boolean;
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
};

export function RhfCalendarDatePicker({
  name,
  label,
  placeholder,
  displayFormat,
  hideErrorText,
  disabled,
  endAdornment,
  startAdornment,
}: RhfCalendarDatePickerProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <CalendarDatePicker
          value={value ?? null}
          onChange={onChange}
          label={label}
          placeholder={placeholder}
          displayFormat={displayFormat}
          error={error}
          hideErrorText={hideErrorText}
          disabled={disabled}
          endAdornment={endAdornment}
          startAdornment={startAdornment}
        />
      )}
    />
  );
}
