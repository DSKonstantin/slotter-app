import React from "react";
import { Switch as RNSwitch, SwitchProps } from "react-native";
import { colors } from "@/src/styles/colors";

type AppSwitchProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
} & Omit<SwitchProps, "value" | "onValueChange">;

export function Switch({
  value,
  onChange,
  disabled,
  ...props
}: AppSwitchProps) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{
        false: colors.gray.lighter,
        true: colors.accent.slotterGreen,
      }}
      thumbColor={value ? colors.secondary.DEFAULT : colors.secondary.DEFAULT}
      ios_backgroundColor={colors.gray.lighter}
      {...props}
    />
  );
}
