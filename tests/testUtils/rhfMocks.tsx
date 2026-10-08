import React from "react";
import { Pressable, TextInput } from "react-native";
import { useController } from "react-hook-form";

export const RhfTextFieldMock = ({
  name,
  placeholder,
  maskFn,
  secureTextEntry,
  endAdornment,
}: {
  name: string;
  placeholder?: string;
  maskFn?: (value: string) => string;
  secureTextEntry?: boolean;
  endAdornment?: React.ReactNode;
}) => {
  const { field } = useController({ name });

  return (
    <>
      <TextInput
        testID={name}
        value={field.value ?? ""}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        onChangeText={(text) => field.onChange(maskFn ? maskFn(text) : text)}
      />
      {endAdornment}
    </>
  );
};

export const RhfCheckboxMock = ({ name }: { name: string }) => {
  const { field } = useController({ name });

  return (
    <Pressable
      testID={name}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!field.value }}
      onPress={() => field.onChange(!field.value)}
    />
  );
};
