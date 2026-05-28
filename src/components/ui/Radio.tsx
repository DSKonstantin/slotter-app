import React from "react";
import { Pressable, View } from "react-native";
import { colors } from "@/src/styles/colors";

type RadioProps = {
  value: boolean;
  onChange?: (value: boolean) => void;
  pressable?: boolean;
  disabled?: boolean;
};

export function Radio({
  value,
  onChange,
  pressable = true,
  disabled = false,
}: RadioProps) {
  const Wrapper = pressable && !disabled ? Pressable : View;

  return (
    <Wrapper
      {...(pressable && !disabled ? { onPress: () => onChange?.(!value) } : {})}
      className="h-[32px] w-[32px] items-center justify-center"
    >
      <View
        className={`h-[22px] w-[22px] items-center justify-center rounded-full border-2 ${
          value ? "border-primary-blue-500" : "border-neutral-300"
        }`}
      >
        {value && (
          <View
            style={{ backgroundColor: colors.primary.blue[500] }}
            className="h-[12px] w-[12px] rounded-full"
          />
        )}
      </View>
    </Wrapper>
  );
}
