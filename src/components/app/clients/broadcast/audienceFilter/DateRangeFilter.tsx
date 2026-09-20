import React, { useState } from "react";
import { View } from "react-native";

import { PressableField, Typography } from "@/src/components/ui";
import { RangeCalendar } from "@/src/components/ui/pickers/RangeCalendar";
import { formatNumericDate } from "@/src/utils/date/formatDate";
import {
  setRangeEndpoint,
  toRangeEndpoints,
  type DateRange,
} from "@/src/utils/date/dateRange";

type Props = {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
  enableYearPicker?: boolean;
};

const formatInput = (apiDate: string | null | undefined) =>
  apiDate ? formatNumericDate(new Date(apiDate)) : null;

const Adornment = ({ children }: { children: string }) => (
  <Typography className="text-body text-neutral-500">{children}</Typography>
);

export const DateRangeFilter = ({
  value,
  onChange,
  enableYearPicker,
}: Props) => {
  const [active, setActive] = useState<"from" | "to">("from");

  const { start, end } = toRangeEndpoints(value);
  const activeDate = active === "from" ? value?.from : value?.to;
  const initialMonth = activeDate ?? value?.from ?? value?.to;

  const handleDayPress = (date: string) => {
    onChange(setRangeEndpoint(value, active, date));
    if (active === "from") setActive("to");
  };

  return (
    <RangeCalendar
      start={start}
      end={end}
      initialMonth={initialMonth}
      enableYearPicker={enableYearPicker}
      onDayPress={handleDayPress}
      header={
        <View className="mb-2 flex-row gap-2">
          <View className="flex-1">
            <PressableField
              startAdornment={<Adornment>От</Adornment>}
              placeholder="--.--.--"
              value={formatInput(value?.from)}
              onPress={() => setActive("from")}
              active={active === "from"}
              textClassName="text-right"
              fieldClassName="bg-white"
              hideErrorText
            />
          </View>
          <View className="flex-1">
            <PressableField
              startAdornment={<Adornment>До</Adornment>}
              placeholder="--.--.--"
              value={formatInput(value?.to)}
              onPress={() => setActive("to")}
              active={active === "to"}
              textClassName="text-right"
              fieldClassName="bg-white"
              hideErrorText
            />
          </View>
        </View>
      }
    />
  );
};
