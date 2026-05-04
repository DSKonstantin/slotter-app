import React, { ReactNode } from "react";
import { Pressable, Text } from "react-native";
import { useController, useFormContext } from "react-hook-form";

import { BaseField, FieldSize } from "@/src/components/ui/fields/BaseField";
import { colors } from "@/src/styles/colors";
import { useComposedFieldRef } from "@/src/hooks/useScrollToError";

type RhfPressableFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  displayValue?: string | null;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  onEndAdornmentPress?: () => void;
  hideErrorText?: boolean;
  disabled?: boolean;
  size?: FieldSize;
  onPress: () => void;
};

export function RhfPressableField({
  name,
  label,
  placeholder,
  displayValue,
  startAdornment,
  endAdornment,
  onEndAdornmentPress,
  hideErrorText,
  disabled,
  size,
  onPress,
}: RhfPressableFieldProps) {
  const { control } = useFormContext();
  const {
    field: { ref },
    fieldState: { error },
  } = useController({ name, control });
  const setRef = useComposedFieldRef(name, ref);

  return (
    <BaseField
      ref={setRef}
      label={label}
      error={error}
      hideErrorText={hideErrorText}
      disabled={disabled}
      size={size}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      onEndAdornmentPress={onEndAdornmentPress}
      renderControl={() => (
        <Pressable
          className="flex-1 justify-center active:opacity-70"
          disabled={disabled}
          onPress={onPress}
        >
          <Text
            className="font-inter-regular text-body px-4"
            style={{
              color: displayValue ? colors.neutral[900] : colors.neutral[300],
            }}
          >
            {displayValue ?? placeholder ?? ""}
          </Text>
        </Pressable>
      )}
    />
  );
}
