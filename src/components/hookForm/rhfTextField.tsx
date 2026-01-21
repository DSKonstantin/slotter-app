import React from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { Controller, useFormContext } from "react-hook-form";

type RHFTextFieldProps = {
  name: string;
} & TextInputProps;

export function RHFTextField({ name, ...other }: RHFTextFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <View>
          <TextInput
            {...field}
            className="border border-gray-300 rounded-xl px-4 py-3"
            {...other}
          />
        </View>
      )}
    />
  );
}
