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

export type AutocompleteProps = {
  value: string;
  label?: string;
  error?: FieldError;
  disabled?: boolean;
  hideErrorText?: boolean;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;

  dataSet?: AutocompleteItem[];
  initialItem?: AutocompleteItem;
  onSelectItem?: (item: AutocompleteItem | null) => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  emptyText?: string;
};

export function Autocomplete({
  value,
  label,
  error,
  disabled,
  dataSet,
  hideErrorText,
  onSelectItem,
  onChangeText,
  startAdornment,
  initialItem,
  placeholder = "Введите",
  emptyText = "Ничего не найдено",
}: AutocompleteProps) {
  const dropdownController = useRef<IAutocompleteDropdownRef | null>(null);
  const currentTextRef = useRef<string>(initialItem?.title ?? value ?? "");
  const suppressNextSelect = useRef(false);

  return (
    <BaseField
      label={label}
      error={error}
      hideErrorText={hideErrorText}
      disabled={disabled}
      renderControl={({ setFocused }) => (
        <AutocompleteDropdown
          initialValue={
            initialItem ?? (value ? { id: value, title: value } : undefined)
          }
          controller={(controller) => {
            dropdownController.current = controller;
          }}
          clearOnFocus={false}
          closeOnBlur={true}
          closeOnSubmit={false}
          showChevron={false}
          showClear={false}
          LeftComponent={
            startAdornment ? (
              <View style={{ justifyContent: "center", paddingLeft: 8 }}>
                {startAdornment}
              </View>
            ) : undefined
          }
          onChangeText={(text) => {
            currentTextRef.current = text ?? "";
            onChangeText?.(text ?? "");
          }}
          onSelectItem={(item) => {
            if (suppressNextSelect.current) {
              suppressNextSelect.current = false;
              return;
            }
            if (item?.title) {
              currentTextRef.current = item.title;
            }
            onSelectItem?.(
              item ? { id: item.id, title: item.title ?? "" } : null,
            );
          }}
          dataSet={dataSet ?? []}
          emptyResultText={emptyText}
          containerStyle={{ flex: 1 }}
          inputContainerStyle={{
            borderRadius: 14,
            borderWidth: 0,
            backgroundColor: "transparent",
          }}
          suggestionsListContainerStyle={{
            borderRadius: 16,
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
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
            multiline: false,
            scrollEnabled: false,
            textAlignVertical: "center",
            style: {
              ...styles.text,
              paddingTop: 0,
              paddingBottom: 0,
              includeFontPadding: false,
            },
          }}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => {
            setFocused(false);
            const text = currentTextRef.current;
            setTimeout(() => {
              // setInputText won't work if searchText already equals text (no state change → effect skips).
              // setItem always creates a new object reference, so the effect always fires → inputValue updates.
              suppressNextSelect.current = true;
              dropdownController.current?.setItem?.({ id: text, title: text });
            }, 0);
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
