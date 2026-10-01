import React, { ReactNode, useRef } from "react";
import type { FieldError } from "react-hook-form";
import {
  AutocompleteDropdown,
  IAutocompleteDropdownRef,
  type AutocompleteDropdownItem,
} from "react-native-autocomplete-dropdown";
import { BaseField } from "@/src/components/ui/fields/BaseField";
import { View } from "react-native";
import { AppText } from "@/src/components/ui/AppText";
import { colors } from "@/src/styles/colors";
import { MAX_FONT_SCALE } from "@/src/constants/layout";

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
  loading?: boolean;
  debounceDelay?: number;
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
  loading = false,
  debounceDelay = 0,
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
          loading={loading}
          debounce={debounceDelay}
          dataSet={dataSet ?? []}
          EmptyResultComponent={
            <View style={{ padding: 10 }}>
              <AppText
                maxFontSizeMultiplier={MAX_FONT_SCALE}
                style={{ textAlign: "center" }}
              >
                {emptyText}
              </AppText>
            </View>
          }
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
          renderItem={renderSuggestion}
          textInputProps={{
            placeholder: placeholder,
            maxFontSizeMultiplier: MAX_FONT_SCALE,
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
              suppressNextSelect.current = true;
              dropdownController.current?.setItem?.({ id: text, title: text });
            }, 0);
          }}
        />
      )}
    />
  );
}

const renderSuggestion = (
  item: AutocompleteDropdownItem,
  searchText: string,
) => {
  const title = item.title ?? "";
  const index = searchText
    ? title.toLowerCase().indexOf(searchText.toLowerCase())
    : -1;
  const end = index + searchText.length;

  return (
    <View style={{ padding: 15 }}>
      <AppText
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        numberOfLines={2}
        style={styles.text}
      >
        {index === -1 ? (
          title
        ) : (
          <>
            {title.slice(0, index)}
            <AppText style={{ fontWeight: "bold" }}>
              {title.slice(index, end)}
            </AppText>
            {title.slice(end)}
          </>
        )}
      </AppText>
    </View>
  );
};

const styles = {
  text: {
    color: "black",
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
};
