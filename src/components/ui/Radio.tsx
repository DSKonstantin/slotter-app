import React from "react";
import { Pressable, View } from "react-native";
import { colors } from "@/src/styles/colors";
import { StSvg } from "@/src/components/ui/StSvg";

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
      className="h-[24px] w-[24px] items-center justify-center rounded-full"
      style={{
        backgroundColor: value
          ? colors.primary.green[500]
          : colors.neutral[200],
        borderWidth: 1,
        borderColor: value ? colors.primary.green[500] : colors.neutral[0],
      }}
    >
      {value && (
        <StSvg name="Done_round" size={16} color={colors.neutral[900]} />
      )}
    </Wrapper>
  );
}
