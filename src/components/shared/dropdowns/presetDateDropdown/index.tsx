import React, { useState } from "react";
import DropDownPicker, { ItemType } from "react-native-dropdown-picker";
import { colors } from "@/src/styles/colors";
import { StSvg } from "@/src/components/ui";

type SelectProps<T extends ItemType<string>> = {
  value: string | null;
  items: T[];
  onChange: (value: string | null) => void;
};

export const PresetDateDropdown = <T extends ItemType<string>>({
  value,
  items,
  onChange,
}: SelectProps<T>) => {
  const [open, setOpen] = useState(false);

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      zIndex={3000}
      props={{
        hitSlop: { top: 10, bottom: 10 },
      }}
      zIndexInverse={1000}
      disableBorderRadius={false}
      placeholder="день"
      setValue={(callback) => {
        const nextValue =
          typeof callback === "function" ? callback(value) : callback;

        onChange(nextValue ?? null);
      }}
      style={{
        borderRadius: 10,
        minHeight: 33,
        height: 33,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: colors.neutral[100],
        backgroundColor: colors.neutral[0],
      }}
      itemSeparator={true}
      itemSeparatorStyle={{
        backgroundColor: colors.gray.separators,
        marginHorizontal: 16,
      }}
      ArrowDownIconComponent={() => (
        <StSvg name="Expand_down" size={16} color={colors.neutral[500]} />
      )}
      ArrowUpIconComponent={() => (
        <StSvg name="Expand_up" size={16} color={colors.neutral[500]} />
      )}
      arrowIconContainerStyle={{
        marginLeft: 2,
      }}
      containerStyle={{
        width: 92,
        height: 33,
      }}
      dropDownContainerStyle={{
        width: 149,
        borderRadius: 10,
        borderColor: colors.neutral[200],
        backgroundColor: colors.neutral[0],
        padding: 0,
        marginTop: 4,
      }}
      textStyle={{
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: -0.17,
        color: colors.neutral[500],
      }}
      labelStyle={{
        textTransform: "lowercase",
        fontFamily: "inter-semibold",
        fontSize: 16,
        color: colors.neutral[900],
      }}
      placeholderStyle={{
        fontFamily: "inter-regular",
        fontSize: 16,
      }}
      selectedItemLabelStyle={{
        color: colors.neutral[900],
        fontFamily: "inter-semibold",
      }}
      listItemContainerStyle={{
        height: 48,
      }}
      listItemLabelStyle={{
        fontFamily: "inter-regular",
      }}
      showTickIcon={false}
      listMode="SCROLLVIEW"
    />
  );
};
