import React from "react";
import { View, Pressable } from "react-native";
import { Controller, useFormContext } from "react-hook-form";

// ========================
// TYPES
// ========================

type ColorOption = {
  label: string;
  value: string;
};

type Props = {
  name: string;
  colors: ColorOption[];
};

// ========================
// COMPONENT
// ========================

const RhfColorPicker = ({ name, colors }: Props) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View className="flex-row gap-4">
          {colors.map((color) => {
            const isSelected = value === color.value;

            return (
              <Pressable
                key={color.value}
                onPress={() => onChange(color.value)}
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{
                  backgroundColor: color.value,
                }}
              >
                {isSelected && (
                  <View className="w-5 h-5 rounded-full bg-white opacity-90" />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    />
  );
};

export default RhfColorPicker;
