import React, { ReactNode, useRef, useState } from "react";
import { View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { addMonths, subMonths } from "date-fns";

import { Button } from "@/src/components/ui/Button";
import { IconButton } from "@/src/components/ui/IconButton";
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
  enableYearPicker?: boolean;
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

const YearArrow = ({ direction }: { direction: "left" | "right" }) => {
  const iconName = direction === "left" ? "Expand_left" : "Expand_right";
  return (
    <View className="flex-row">
      <StSvg name={iconName} size={24} color={colors.neutral[500]} />
      <StSvg
        name={iconName}
        size={24}
        color={colors.neutral[500]}
        style={{ marginLeft: -12 }}
      />
    </View>
  );
};

const renderArrowWithYearPicker = (
  direction: "left" | "right",
  onShiftYear: (direction: 1 | -1) => void,
) => (
  <View className="flex-row items-center gap-1">
    {direction === "left" && (
      <IconButton
        size="sm"
        buttonClassName="bg-transparent"
        onPress={() => onShiftYear(-1)}
        icon={<YearArrow direction="left" />}
      />
    )}
    {renderCalendarArrow(direction)}
    {direction === "right" && (
      <IconButton
        size="sm"
        buttonClassName="bg-transparent"
        onPress={() => onShiftYear(1)}
        icon={<YearArrow direction="right" />}
      />
    )}
  </View>
);

export const RangeCalendar = ({
  start,
  end,
  onDayPress,
  onApply,
  applyLabel = "Применить",
  header,
  initialMonth,
  enableYearPicker = false,
}: RangeCalendarProps) => {
  // Frozen once: consumers that don't drive `initialMonth` keep the month the
  // calendar mounted on (matches the previous `current`-only behaviour).
  const fallbackMonth = useRef(start ?? formatApiDate(new Date())).current;
  const [visibleMonth, setVisibleMonth] = useState(
    initialMonth ?? fallbackMonth,
  );

  const shiftYear = (direction: 1 | -1) => {
    const base = new Date(visibleMonth);
    const next = direction === 1 ? addMonths(base, 12) : subMonths(base, 12);
    setVisibleMonth(formatApiDate(next));
  };

  return (
    <View className="mt-2">
      {header}
      <View style={{ minHeight: CALENDAR_MIN_HEIGHT }}>
        <Calendar
          key={visibleMonth}
          initialDate={visibleMonth}
          onDayPress={(day) => onDayPress(day.dateString)}
          onMonthChange={(month: DateData) => setVisibleMonth(month.dateString)}
          markedDates={buildRangeMarks(start, end)}
          renderArrow={
            enableYearPicker
              ? (direction) => renderArrowWithYearPicker(direction, shiftYear)
              : renderCalendarArrow
          }
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
