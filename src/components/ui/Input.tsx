import { ReactNode, useState } from "react";
import { View, TextInput, Text, TextInputProps } from "react-native";
import { twMerge } from "tailwind-merge";

type InputProps = {
  label?: string;
  error?: string;
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
    <View className="w-full">
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
          className={styles.input}
          placeholderTextColor="#8E8E93"
        />

        {endAdornment && (
          <View className={styles.adornmentEnd}>{endAdornment}</View>
        )}
      </View>

      {error && <Text className={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = {
  label: "mb-1 text-gray text-caption",

  base: "flex-row items-center h-[48px] rounded-full px-4 bg-secondary border border-transparent",

  focus: "border-accent",

  error: "border-red-500",

  disabled: "bg-gray-muted",

  input: "flex-1 font-inter-regular text-body text-primary",

  adornmentStart: "mr-2",

  adornmentEnd: "ml-2",

  errorText: "mt-1 text-red-500 text-caption",
};
