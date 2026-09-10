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
  title?: string;
  hideErrorText?: boolean;
  fieldClassName?: string;
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
  title,
  hideErrorText,
  fieldClassName,
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
      title={title}
      error={error}
      hideErrorText={hideErrorText}
      fieldClassName={fieldClassName}
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
