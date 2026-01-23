import { ReactNode, useState } from "react";
import { View, TextInput, Text, TextInputProps } from "react-native";
import { twMerge } from "tailwind-merge";
import { FieldError } from "react-hook-form";
import { colors } from "@/src/styles/colors";

type InputProps = {
  label?: string;
  error?: FieldError | undefined;
  disabled?: boolean;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
} & TextInputProps;

export function Input({
  label,
  error,
  disabled,
  startAdornment,
  endAdornment,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="flex-1">
      {label && <Text className={styles.label}>{label}</Text>}

      <View
        className={twMerge(
          styles.base,
          focused && styles.focus,
          error && styles.error,
          disabled && styles.disabled,
        )}
      >
        {startAdornment && (
          <View className={styles.adornmentStart}>{startAdornment}</View>
        )}

        <TextInput
          {...props}
          editable={!disabled}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={twMerge(styles.input)}
          placeholderTextColor={colors.gray.muted}
        />

        {endAdornment && (
          <View className={styles.adornmentEnd}>{endAdornment}</View>
        )}
      </View>

      <View className={styles.errorContainer}>
        {error && <Text className={styles.errorText}>{error?.message}</Text>}
      </View>
    </View>
  );
}

const styles = {
  label: "mb-2 font-inter-medium text-gray text-caption",

  base: "flex-row items-center h-[48px] rounded-small px-4 bg-secondary border border-transparent",

  focus: "border-accent",

  error: "border-accent-red",

  disabled: "bg-gray-muted",

  input: "flex-1 font-inter-regular text-primary text-[16px]",

  adornmentStart: "mr-2",

  adornmentEnd: "ml-2",

  errorContainer: "min-h-[20px]",
  errorText: "mt-[2px] text-accent-red text-caption",
};
