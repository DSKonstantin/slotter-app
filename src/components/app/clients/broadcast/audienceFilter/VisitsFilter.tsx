import React from "react";
import { View } from "react-native";

import { Input, Typography } from "@/src/components/ui";
import { parseDigits } from "@/src/utils/text/parseDigits";
import type { AudienceFilters } from "./types";

type VisitsValue = AudienceFilters["visits"];

type Props = {
  value: VisitsValue;
  onChange: (value: VisitsValue) => void;
};

const toText = (value: number | undefined) =>
  value == null ? "" : String(value);

export const VisitsFilter = ({ value, onChange }: Props) => {
  const update = (patch: { from?: number; to?: number }) => {
    const next = { from: value?.from, to: value?.to, ...patch };
    onChange(next.from == null && next.to == null ? undefined : next);
  };

  return (
    <View className="mt-2 flex-row gap-2">
      <View className="flex-1">
        <Input
          label="От"
          placeholder="0"
          keyboardType="number-pad"
          value={toText(value?.from)}
          onChangeText={(text) => update({ from: parseDigits(text) })}
          endAdornment={
            <Typography className="text-body text-neutral-500">
              посещ
            </Typography>
          }
          hideErrorText
        />
      </View>
      <View className="flex-1">
        <Input
          label="До"
          placeholder="0"
          keyboardType="number-pad"
          value={toText(value?.to)}
          onChangeText={(text) => update({ to: parseDigits(text) })}
          endAdornment={
            <Typography className="text-body text-neutral-500">
              посещ
            </Typography>
          }
          hideErrorText
        />
      </View>
    </View>
  );
};
