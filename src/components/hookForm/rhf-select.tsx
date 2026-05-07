import React, { ReactNode } from "react";
import { useController, useFormContext } from "react-hook-form";
import { DropDown } from "@/src/components/ui";
import type { SelectItem } from "@/src/components/ui/fields/DropDown";
import { useComposedFieldRef } from "@/src/hooks/useScrollToError";

type RHFSelectFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  items: readonly SelectItem[];
  endAdornment?: ReactNode;
  onEndAdornmentPress?: () => void;
};

export function RHFSelect({
  name,
  label,
  items,
  placeholder,
  emptyText,
  disabled,
  endAdornment,
  onEndAdornmentPress,
}: RHFSelectFieldProps) {
  const { control } = useFormContext();
  const {
    field: { value, onChange, ref },
    fieldState: { error },
  } = useController({ name, control });
  const setRef = useComposedFieldRef(name, ref);

  return (
    <DropDown
      ref={setRef}
      label={label}
      value={value ?? null}
      onChange={onChange}
      items={items}
      placeholder={placeholder}
      emptyText={emptyText}
      disabled={disabled}
      error={error}
      endAdornment={endAdornment}
      onEndAdornmentPress={onEndAdornmentPress}
    />
  );
}
