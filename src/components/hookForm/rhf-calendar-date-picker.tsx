import React, { ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import { CalendarDatePicker } from "@/src/components/ui/fields/CalendarDatePicker";
import { useComposedFieldRef } from "@/src/hooks/useScrollToError";

type RhfCalendarDatePickerProps = {
  name: string;
  label?: string;
  placeholder?: string;
  displayFormat?: (isoDate: string) => string;
  hideErrorText?: boolean;
  disabled?: boolean;
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
  userId?: number;
  onNonWorkingDaySuccess?: (date: string) => void;
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
  userId,
  onNonWorkingDaySuccess,
}: RhfCalendarDatePickerProps) {
  const { control } = useFormContext();
  const {
    field: { value, onChange, ref },
    fieldState: { error },
  } = useController({ name, control });
  const setRef = useComposedFieldRef(name, ref);

  return (
    <CalendarDatePicker
      ref={setRef}
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
      userId={userId}
      onNonWorkingDaySuccess={onNonWorkingDaySuccess}
    />
  );
}
