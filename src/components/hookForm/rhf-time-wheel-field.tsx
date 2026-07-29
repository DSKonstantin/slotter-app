import React, { ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import { TimeWheelField } from "@/src/components/ui/fields/TimeWheelField";
import { useComposedFieldRef } from "@/src/hooks/useScrollToError";

type RhfTimeWheelFieldProps = {
  name: string;
  options: number[];
  defaultValue?: number;

  label?: string;
  placeholder?: string;
  hideErrorText?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  loop?: boolean;
  onOpen?: () => void;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;

  formatValue?: (minutes: number) => unknown;
  parseValue?: (value: unknown) => number | null;
  formatDisplay?: (minutes: number) => string;
};

export function RhfTimeWheelField({
  name,
  options,
  defaultValue,
  label,
  placeholder,
  hideErrorText,
  disabled,
  isLoading,
  loop,
  onOpen,
  startAdornment,
  endAdornment,
  formatValue,
  parseValue,
  formatDisplay,
}: RhfTimeWheelFieldProps) {
  const { control } = useFormContext();
  const {
    field: { onChange, value, ref },
    fieldState: { error },
  } = useController({ name, control });
  const setRef = useComposedFieldRef(name, ref);

  return (
    <TimeWheelField
      ref={setRef}
      value={parseValue ? parseValue(value) : (value ?? null)}
      options={options}
      defaultValue={defaultValue}
      label={label}
      placeholder={placeholder}
      error={error}
      hideErrorText={hideErrorText}
      disabled={disabled}
      isLoading={isLoading}
      loop={loop}
      onOpen={onOpen}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      formatDisplay={formatDisplay}
      onChange={(minutes: number) => {
        onChange(formatValue ? formatValue(minutes) : minutes);
      }}
    />
  );
}
