import React, { Ref, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown, type IDropdownRef } from "react-native-element-dropdown";
import { BaseField } from "./BaseField";
import { FieldError } from "react-hook-form";
import { colors } from "@/src/styles/colors";
import { StSvg } from "@/src/components/ui/StSvg";

export type SelectItem = { label: string; value: string };

type SelectFieldProps = {
  label?: string;
  error?: FieldError;
  disabled?: boolean;

  value: string | null;
  onChange: (val: string | null) => void;

  items: readonly SelectItem[];
  placeholder?: string;
  emptyText?: string;
  ref?: Ref<View>;
  endAdornment?: React.ReactNode;
  onEndAdornmentPress?: () => void;
};

export function DropDown({
  label,
  error,
  disabled,
  value,
  onChange,
  items,
  placeholder = "Выберите",
  emptyText = "Нет вариантов",
  endAdornment,
  onEndAdornmentPress,
  ref,
}: SelectFieldProps) {
  const dropdownRef = useRef<IDropdownRef>(null);

  return (
    <BaseField
      ref={ref}
      label={label}
      error={error}
      disabled={disabled}
      endAdornment={endAdornment}
      onEndAdornmentPress={
        onEndAdornmentPress ??
        (endAdornment ? () => dropdownRef.current?.open() : undefined)
      }
      renderControl={({ setFocused }) => (
        <Dropdown
          ref={dropdownRef}
          style={styles.dropdown}
          containerStyle={styles.panel}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.text}
          itemContainerStyle={styles.itemContainer}
          itemTextStyle={styles.text}
          activeColor={colors.background.surface}
          data={items as SelectItem[]}
          labelField="label"
          valueField="value"
          placeholder={placeholder}
          value={value}
          disable={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(item: SelectItem) => onChange(item?.value ?? null)}
          renderRightIcon={(visible?: boolean) => (
            <StSvg
              name={visible ? "Expand_up_light" : "Expand_down_light"}
              size={24}
              color={colors.neutral[300]}
            />
          )}
          renderItem={(item: SelectItem, selected?: boolean) => (
            <View className="flex-row items-center justify-between py-2.5">
              <Text className="font-inter-regular text-body text-neutral-900">
                {item.label}
              </Text>
              {selected && (
                <StSvg
                  name="Done_round"
                  size={24}
                  color={colors.primary.blue[500]}
                />
              )}
            </View>
          )}
          flatListProps={{
            ListEmptyComponent: (
              <Text className="font-inter-regular text-body text-neutral-500 text-center py-4">
                {emptyText}
              </Text>
            ),
          }}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  panel: {
    borderRadius: 16,
    borderWidth: 0,
    marginTop: 4,
    backgroundColor: colors.background.surface,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  itemContainer: {
    borderRadius: 0,
    paddingHorizontal: 16,
  },
  text: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: colors.neutral[900],
  },
  placeholder: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: colors.neutral[300],
  },
});
