import React, { ReactNode, useRef } from "react";
import type { FieldError } from "react-hook-form";
import {
  AutocompleteDropdown,
  IAutocompleteDropdownRef,
} from "react-native-autocomplete-dropdown";
import { BaseField } from "@/src/components/ui/fields/BaseField";
import { View } from "react-native";
import { colors } from "@/src/styles/colors";

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
          closeOnBlur={true}
          closeOnSubmit={false}
          showChevron={false}
          showClear={false}
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
            backgroundColor: "white",
          }}
          suggestionsListTextStyle={{
            ...styles.text,
            color: "black",
          }}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 1,
                backgroundColor: colors.gray.separators,
                marginHorizontal: 16,
              }}
            />
          )}
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
    color: "black",
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
};
