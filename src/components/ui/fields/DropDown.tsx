import React, { useState } from "react";
import DropDownPicker, { ItemType } from "react-native-dropdown-picker";
import { BaseField } from "./BaseField";
import { FieldError } from "react-hook-form";
import { colors } from "@/src/styles/colors";
import { StSvg } from "@/src/components/ui/StSvg";

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
          theme={"LIGHT"}
          itemSeparator={true}
          itemSeparatorStyle={{
            backgroundColor: colors.gray.separators,
            marginHorizontal: 16,
          }}
          TickIconComponent={() => (
            <StSvg
              name="Done_round"
              size={24}
              color={colors.primary.blue[500]}
            />
          )}
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
          ArrowDownIconComponent={() => (
            <StSvg
              name="Expand_down_light"
              size={24}
              color={colors.neutral[300]}
            />
          )}
          ArrowUpIconComponent={() => (
            <StSvg
              name="Expand_up_light"
              size={24}
              color={colors.neutral[300]}
            />
          )}
          style={{ borderWidth: 0, backgroundColor: "transparent", flex: 1 }}
          dropDownContainerStyle={{
            borderRadius: 16,
            borderWidth: 0,
          }}
          labelStyle={{
            ...styles.text,
            color: colors.primary.DEFAULT,
          }}
          placeholderStyle={{
            ...styles.text,
            color: colors.neutral[300],
          }}
          listItemContainerStyle={{
            paddingVertical: 10,
            paddingHorizontal: 16,
            height: "auto",
          }}
          listItemLabelStyle={{
            ...styles.text,
          }}
          listMode="SCROLLVIEW"
        />
      )}
    />
  );
}

const styles = {
  text: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
};
