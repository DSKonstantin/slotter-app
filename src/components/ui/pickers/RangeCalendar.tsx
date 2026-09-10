import React, { ReactNode, useRef } from "react";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";

import { Button } from "@/src/components/ui/Button";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";
import { pickerCalendarTheme } from "@/src/styles/calendarTheme";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { buildRangeMarks } from "@/src/utils/date/calendarRangeMarks";

type RangeCalendarProps = {
  start: string | null;
  end: string | null;
  onDayPress: (date: string) => void;
  onApply?: () => void;
  applyLabel?: string;
  header?: ReactNode;
  initialMonth?: string;
};

const CALENDAR_MIN_HEIGHT = 340;

const headerStylesheet = pickerCalendarTheme["stylesheet.calendar.header"];

export const rangeCalendarTheme = {
  ...pickerCalendarTheme,
  "stylesheet.calendar.header": {
    ...headerStylesheet,
    header: {
      ...headerStylesheet.header,
      justifyContent: "center" as const,
      paddingLeft: 0,
      paddingRight: 0,
    },
    arrow: { paddingVertical: 10, paddingHorizontal: 2 },
  },
};

export const renderCalendarArrow = (direction: "left" | "right") => (
  <StSvg
    name={direction === "left" ? "Expand_left" : "Expand_right"}
    size={24}
    color={colors.neutral[500]}
  />
);

export const RangeCalendar = ({
  start,
  end,
  onDayPress,
  onApply,
  applyLabel = "Применить",
  header,
  initialMonth,
}: RangeCalendarProps) => {
  // Frozen once: consumers that don't drive `initialMonth` keep the month the
  // calendar mounted on (matches the previous `current`-only behaviour).
  const fallbackMonth = useRef(start ?? formatApiDate(new Date())).current;

  return (
    <View className="mt-2">
      {header}
      <View style={{ minHeight: CALENDAR_MIN_HEIGHT }}>
        <Calendar
          initialDate={initialMonth ?? fallbackMonth}
          onDayPress={(day) => onDayPress(day.dateString)}
          markedDates={buildRangeMarks(start, end)}
          renderArrow={renderCalendarArrow}
          hideExtraDays
          theme={rangeCalendarTheme}
        />
      </View>
      {onApply && (
        <Button
          title={applyLabel}
          disabled={!start}
          onPress={onApply}
          buttonClassName="mt-3 w-full"
        />
      )}
    </View>
  );
};
