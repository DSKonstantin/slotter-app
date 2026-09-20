import React, { Ref, useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown, type IDropdownRef } from "react-native-element-dropdown";
import { BaseField } from "./BaseField";
import { FieldError } from "react-hook-form";
import { colors } from "@/src/styles/colors";
import { StSvg } from "@/src/components/ui/StSvg";

export type SelectItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

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
  inline?: boolean;
};

const Separator = () => <View className="h-px bg-neutral-100 mx-4" />;

const EmptyText = ({ children }: { children: string }) => (
  <Text className="font-inter-regular text-body text-neutral-500 text-center py-4">
    {children}
  </Text>
);

const CenteredOption = ({
  label,
  muted,
}: {
  label: string;
  muted?: boolean;
}) => (
  <View className="px-4 py-3">
    <Text
      className={`text-center font-inter-regular text-body ${
        muted ? "text-neutral-300" : "text-neutral-900"
      }`}
      numberOfLines={1}
    >
      {label}
    </Text>
  </View>
);

const DefaultOption = ({
  item,
  selected,
}: {
  item: SelectItem;
  selected?: boolean;
}) => (
  <View className="flex-row items-center justify-between py-2.5">
    <Text
      className={`font-inter-regular text-body ${
        item.disabled ? "text-neutral-300" : "text-neutral-900"
      }`}
    >
      {item.label}
    </Text>
    {item.disabled ? (
      <Text className="font-inter-regular text-caption text-neutral-400">
        Не подключено
      </Text>
    ) : (
      selected && (
        <StSvg name="Done_round" size={24} color={colors.primary.blue[500]} />
      )
    )}
  </View>
);

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
  inline,
  ref,
}: SelectFieldProps) {
  const dropdownRef = useRef<IDropdownRef>(null);

  const { enabledItems, disabledItems } = useMemo(() => {
    if (!inline) {
      return {
        enabledItems: items as SelectItem[],
        disabledItems: [] as SelectItem[],
      };
    }
    return {
      enabledItems: items.filter((it) => !it.disabled),
      disabledItems: items.filter((it) => it.disabled),
    };
  }, [items, inline]);

  const flatListProps = useMemo(() => {
    if (!inline) {
      return { ListEmptyComponent: <EmptyText>{emptyText}</EmptyText> };
    }
    return {
      ItemSeparatorComponent: Separator,
      ListFooterComponent:
        disabledItems.length > 0 ? (
          <View>
            {enabledItems.length > 0 && <Separator />}
            {disabledItems.map((it, index) => (
              <View key={it.value}>
                {index > 0 && <Separator />}
                <CenteredOption label={`${it.label} (не подключен)`} muted />
              </View>
            ))}
          </View>
        ) : null,
      ListEmptyComponent:
        disabledItems.length > 0 ? null : <EmptyText>{emptyText}</EmptyText>,
    };
  }, [inline, enabledItems, disabledItems, emptyText]);

  const handleChange = useCallback(
    (item: SelectItem) => {
      if (item?.disabled) return;
      onChange(item?.value ?? null);
    },
    [onChange],
  );

  const renderLabel = useCallback(
    () => <Text style={styles.labelInline}>{label}</Text>,
    [label],
  );

  const renderRightIcon = useCallback(
    (visible?: boolean) => (
      <StSvg
        name={visible ? "Expand_up_light" : "Expand_down_light"}
        size={24}
        color={colors.neutral[300]}
      />
    ),
    [],
  );

  const renderItem = useCallback(
    (item: SelectItem, selected?: boolean) =>
      inline ? (
        <CenteredOption label={item.label} />
      ) : (
        <DefaultOption item={item} selected={selected} />
      ),
    [inline],
  );

  const renderDropdown = (setFocused?: (v: boolean) => void) => (
    <Dropdown
      ref={dropdownRef}
      style={inline ? styles.dropdownInline : styles.dropdown}
      containerStyle={inline ? styles.panelInline : styles.panel}
      placeholderStyle={inline ? styles.placeholderInline : styles.placeholder}
      selectedTextStyle={inline ? styles.textInline : styles.text}
      itemContainerStyle={inline ? undefined : styles.itemContainer}
      itemTextStyle={styles.text}
      activeColor={colors.background.surface}
      data={enabledItems}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      value={value}
      disable={disabled}
      dropdownPosition="auto"
      onFocus={setFocused ? () => setFocused(true) : undefined}
      onBlur={setFocused ? () => setFocused(false) : undefined}
      onChange={handleChange}
      renderLeftIcon={inline && label ? renderLabel : undefined}
      renderRightIcon={renderRightIcon}
      renderItem={renderItem}
      flatListProps={flatListProps}
    />
  );

  if (inline) {
    return (
      <View ref={ref} collapsable={false}>
        {renderDropdown()}
        {!!error?.message && (
          <Text className="mt-[2px] font-inter-medium text-caption text-accent-red-500">
            {error.message}
          </Text>
        )}
      </View>
    );
  }

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
      renderControl={({ setFocused }) => renderDropdown(setFocused)}
    />
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  dropdownInline: {
    minHeight: 60,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.background.DEFAULT,
    backgroundColor: colors.background.surface,
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
  panelInline: {
    left: 0,
    alignSelf: "flex-end",
    marginRight: 16,
    marginBottom: 2,
    width: "62%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    overflow: "hidden",
    paddingVertical: 4,
    backgroundColor: colors.background.surface,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
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
  textInline: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: colors.neutral[500],
    textAlign: "right",
    marginRight: 8,
  },
  placeholder: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: colors.neutral[300],
  },
  placeholderInline: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: colors.neutral[400],
    textAlign: "right",
    marginRight: 8,
  },
  labelInline: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: colors.neutral[900],
  },
});
