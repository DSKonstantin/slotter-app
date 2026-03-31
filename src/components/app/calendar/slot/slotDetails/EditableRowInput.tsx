import React from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { Controller, FieldError, useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { colors } from "@/src/styles/colors";

type EditableRowInputProps = {
  error?: FieldError;
  disabled?: boolean;
} & TextInputProps;

type RhfEditableRowInputProps = {
  name: string;
  maskFn?: (value: string) => string;
} & Omit<EditableRowInputProps, "error" | "value" | "onChangeText">;

const EditableRowInput = ({
  error,
  disabled,
  ...props
}: EditableRowInputProps) => {
  return (
    <TextInput
      {...props}
      value={props.value ?? ""}
      editable={!disabled}
      className="flex-1 font-inter-regular text-primary px-2"
      placeholderTextColor={colors.neutral[300]}
      textAlign="right"
    />
  );
};

export const RhfEditableRowInput = ({
  name,
  maskFn,
  ...other
}: RhfEditableRowInputProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <EditableRowInput
          {...other}
          value={value != null ? String(value) : ""}
          error={error}
          onChangeText={(text) => {
            onChange(text);
          }}
        />
      )}
    />
  );
};

export default EditableRowInput;
