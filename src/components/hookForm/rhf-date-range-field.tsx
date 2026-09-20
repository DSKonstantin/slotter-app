import React, { ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import { DateRangeField } from "@/src/components/ui/fields/DateRangeField";
import type { DateRange } from "@/src/hooks/useCalendarRange";
import { useComposedFieldRef } from "@/src/hooks/useScrollToError";

type RhfDateRangeFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  title?: string;
  formatDisplay?: (from: Date, to: Date) => string;
  hideErrorText?: boolean;
  fieldClassName?: string;
  disabled?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

export function RhfDateRangeField({
  name,
  label,
  placeholder,
  title,
  formatDisplay,
  hideErrorText,
  fieldClassName,
  disabled,
  startAdornment,
  endAdornment,
}: RhfDateRangeFieldProps) {
  const { control } = useFormContext();
  const {
    field: { value, onChange, ref },
    fieldState: { error },
  } = useController({ name, control });
  const setRef = useComposedFieldRef(name, ref);

  return (
    <DateRangeField
      ref={setRef}
      value={(value as DateRange | null) ?? null}
      onChange={onChange}
      label={label}
      placeholder={placeholder}
      title={title}
      formatDisplay={formatDisplay}
      error={error}
      hideErrorText={hideErrorText}
      fieldClassName={fieldClassName}
      disabled={disabled}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
    />
  );
}
