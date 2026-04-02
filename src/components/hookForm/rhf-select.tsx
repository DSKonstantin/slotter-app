import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ItemType } from "react-native-dropdown-picker";
import { DropDown } from "@/src/components/ui";

type RHFSelectFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  items: ItemType<string>[];
};

export function RHFSelect({
  name,
  label,
  items,
  placeholder,
  emptyText,
  disabled,
}: RHFSelectFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <DropDown
          label={label}
          value={value ?? null}
          onChange={onChange}
          items={items}
          placeholder={placeholder}
          emptyText={emptyText}
          disabled={disabled}
          error={error}
        />
      )}
    />
  );
}
