import React from "react";
import { TextInput, View } from "react-native";

import { Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { parseDigits } from "@/src/utils/text/parseDigits";

type Props = {
  title: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  unit?: string;
};

export const InlineNumberRow = ({ title, value, onChange, unit }: Props) => (
  <View className="min-h-[52px] flex-row items-center justify-between">
    <Typography className="text-body text-neutral-900">{title}</Typography>
    <View className="flex-row items-center gap-1">
      <TextInput
        className="font-inter-regular text-body text-neutral-900 min-w-[48px] text-right"
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={colors.neutral[300]}
        value={value == null ? "" : String(value)}
        onChangeText={(text) => onChange(parseDigits(text))}
      />
      {unit && (
        <Typography className="text-body text-neutral-400">{unit}</Typography>
      )}
    </View>
  </View>
);
