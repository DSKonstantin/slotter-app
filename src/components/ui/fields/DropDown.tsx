import React, { useState } from "react";
import DropDownPicker, { ItemType } from "react-native-dropdown-picker";
import { BaseField } from "./BaseField";
import { FieldError } from "react-hook-form";

type SelectFieldProps = {
  label?: string;
  error?: FieldError;
  disabled?: boolean;

  value: string | null;
  onChange: (val: string | null) => void;

  items: ItemType<string>[];
  placeholder?: string;
};

export function DropDown({
  label,
  error,
  disabled,
  value,
  onChange,
  items,
  placeholder = "Выберите",
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [innerItems, setInnerItems] = useState(items);

  return (
    <BaseField
      label={label}
      error={error}
      disabled={disabled}
      renderControl={({ setFocused }) => (
        <DropDownPicker
          open={open}
          value={value}
          items={innerItems}
          setOpen={setOpen}
          setValue={(cb) => {
            const next = cb(value);
            onChange(next);
          }}
          setItems={setInnerItems}
          placeholder={placeholder}
          onOpen={() => setFocused(true)}
          onClose={() => setFocused(false)}
          disabled={disabled}
          style={{ borderWidth: 0, backgroundColor: "transparent", flex: 1 }}
          dropDownContainerStyle={{ borderWidth: 0 }}
          listMode="SCROLLVIEW"
        />
      )}
    />
  );
}
