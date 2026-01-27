import React, { ReactNode, useRef } from "react";
import type { FieldError } from "react-hook-form";
import {
  AutocompleteDropdown,
  IAutocompleteDropdownRef,
} from "react-native-autocomplete-dropdown";
import { BaseField } from "@/src/components/ui/fields/BaseField";

export type AutocompleteItem = {
  id: string;
  title: string;
};

type AutocompleteProps = {
  label?: string;
  error?: FieldError;
  disabled?: boolean;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;

  dataSet?: AutocompleteItem[];
  value?: string;
  onSelectItem?: (a: any) => void;
  placeholder?: string;
};

export function Autocomplete({
  label,
  error,
  disabled,
  dataSet,
  onSelectItem,
  placeholder = "Введите",
}: AutocompleteProps) {
  const dropdownController = useRef<IAutocompleteDropdownRef | null>(null);

  return (
    <BaseField
      label={label}
      error={error}
      disabled={disabled}
      renderControl={({ setFocused }) => (
        <AutocompleteDropdown
          controller={(controller) => {
            dropdownController.current = controller;
          }}
          clearOnFocus={false}
          closeOnBlur={false}
          closeOnSubmit={false}
          showChevron={false}
          showClear={false}
          // initialValue={{
          //   id: typeof value === "string" && value.length ? value : "",
          // }}
          // onSelectItem={onSelectItem}
          // onSelectItem={item => {
          //   item && setSelectedItem(item.id)
          // }}
          onChangeText={(text) => {
            if (!text?.trim()) {
              dropdownController.current?.setItem?.({ id: "" });
            }
          }}
          onSelectItem={onSelectItem}
          dataSet={dataSet ?? []}
          containerStyle={{ flex: 1 }}
          inputContainerStyle={{
            borderRadius: 14,
            borderWidth: 0,
            backgroundColor: "transparent",
          }}
          suggestionsListContainerStyle={{
            borderRadius: 16,
          }}
          suggestionsListTextStyle={{
            ...styles.text,
          }}
          textInputProps={{
            placeholder: placeholder,
            style: {
              ...styles.text,
            },
          }}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => {
            setFocused(false);
          }}
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
