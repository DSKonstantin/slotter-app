import { Pressable, View } from "react-native";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";
import React from "react";

type CheckboxProps = {
  value: boolean;
  onChange?: (value: boolean) => void;
  pressable?: boolean;
  disabled?: boolean;
};

export function Checkbox({
  value,
  onChange,
  pressable = true,
  disabled = false,
}: CheckboxProps) {
  const Wrapper = pressable && !disabled ? Pressable : View;

  return (
    <Wrapper
      {...(pressable && !disabled ? { onPress: () => onChange?.(!value) } : {})}
      className={`h-[32px] w-[32px] items-center justify-center`}
    >
      <View
        className={`h-[24px] w-[24px] items-center justify-center rounded-lg ${value ? "bg-primary-green-500 border border-transparent" : "border-neutral-600 border"}`}
      >
        {value && (
          <StSvg
            name="Done_round"
            size={24}
            color={colors.primary.green[800]}
          />
        )}
      </View>
    </Wrapper>
  );
}
