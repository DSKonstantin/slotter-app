import React from "react";
import { View } from "react-native";

import { RhfDatePicker } from "@/src/components/hookForm/rhf-date-picker";
import { Divider, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatTime, parseTimeString } from "@/src/utils/date/formatTime";

type Props = {
  startName: string;
  endName: string;
  label?: string;
};

export const TimeFields = ({ startName, endName, label }: Props) => (
  <View>
    {label && (
      <Typography className="mb-2 text-neutral-500 text-caption">
        {label}
      </Typography>
    )}
    <View className="flex-row gap-2">
      <View className="flex-1">
        <RhfDatePicker
          name={startName}
          placeholder="9:00"
          hideErrorText
          parseValue={parseTimeString}
          formatValue={formatTime}
          endAdornment={
            <StSvg name="Time" size={24} color={colors.neutral[500]} />
          }
        />
      </View>
      <View className="w-5 items-center mt-[25px]">
        <Divider />
      </View>
      <View className="flex-1">
        <RhfDatePicker
          name={endName}
          placeholder="18:00"
          hideErrorText
          parseValue={parseTimeString}
          formatValue={formatTime}
          endAdornment={
            <StSvg name="Time" size={24} color={colors.neutral[500]} />
          }
        />
      </View>
    </View>
  </View>
);
