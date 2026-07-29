import React from "react";
import { View } from "react-native";

import { RhfTimeWheelField } from "@/src/components/hookForm/rhf-time-wheel-field";
import { Divider } from "@/src/components/ui/Divider";
import { StSvg } from "@/src/components/ui/StSvg";
import { Typography } from "@/src/components/ui/Typography";
import { colors } from "@/src/styles/colors";
import {
  formatMinutes,
  getTimeParts,
  parseTimeMinutes,
} from "@/src/utils/date/formatTime";
import { FULL_DAY_MINUTE_OPTIONS } from "@/src/utils/date/timeOptions";

const toMinutes = (date?: Date) => {
  if (!date) return undefined;
  const { hours, minutes } = getTimeParts(date);
  return hours * 60 + minutes;
};

type Props = {
  startName: string;
  endName: string;
  label?: string;
  startDefault?: Date;
  endDefault?: Date;
};

export const TimeFields = ({
  startName,
  endName,
  label,
  startDefault,
  endDefault,
}: Props) => (
  <View>
    {label && (
      <Typography className="mb-2 text-neutral-500 text-caption">
        {label}
      </Typography>
    )}
    <View className="flex-row gap-2">
      <View className="flex-1">
        <RhfTimeWheelField
          name={startName}
          placeholder="9:00"
          options={FULL_DAY_MINUTE_OPTIONS}
          loop
          defaultValue={toMinutes(startDefault)}
          hideErrorText
          parseValue={parseTimeMinutes}
          formatValue={formatMinutes}
          endAdornment={
            <StSvg name="Time" size={24} color={colors.neutral[500]} />
          }
        />
      </View>
      <View className="w-5 items-center mt-[25px]">
        <Divider />
      </View>
      <View className="flex-1">
        <RhfTimeWheelField
          name={endName}
          placeholder="18:00"
          options={FULL_DAY_MINUTE_OPTIONS}
          loop
          defaultValue={toMinutes(endDefault)}
          hideErrorText
          parseValue={parseTimeMinutes}
          formatValue={formatMinutes}
          endAdornment={
            <StSvg name="Time" size={24} color={colors.neutral[500]} />
          }
        />
      </View>
    </View>
  </View>
);
