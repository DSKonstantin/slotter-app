import React, { ReactNode, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { setMonth, setYear } from "date-fns";

import { Button } from "@/src/components/ui/Button";
import { StSvg } from "@/src/components/ui/StSvg";
import { Typography } from "@/src/components/ui/Typography";
import { colors } from "@/src/styles/colors";
import { pickerCalendarTheme } from "@/src/styles/calendarTheme";
import {
  formatApiDate,
  formatDayMonthLong,
  formatMonthName,
} from "@/src/utils/date/formatDate";
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

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 101 }, (_, i) => CURRENT_YEAR - 100 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1));

const OPTION_ROW_HEIGHT = 44;
const OPTION_LIST_MAX_HEIGHT = OPTION_ROW_HEIGHT * 5.5;

type Option = { label: string; value: string; selected: boolean };

const OptionDropdown = ({
  options,
  onSelect,
  width = 160,
}: {
  options: Option[];
  onSelect: (value: string) => void;
  width?: number;
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = options.findIndex((option) => option.selected);

  return (
    <View
      style={{
        position: "absolute",
        top: 41,
        right: 0,
        width,
        maxHeight: OPTION_LIST_MAX_HEIGHT,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.background.DEFAULT,
        backgroundColor: colors.neutral[0],
        paddingHorizontal: 16,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      }}
    >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(_, contentHeight) => {
          if (selectedIndex <= 0) return;
          const y = Math.min(
            selectedIndex * OPTION_ROW_HEIGHT,
            Math.max(0, contentHeight - OPTION_LIST_MAX_HEIGHT),
          );
          scrollRef.current?.scrollTo({ y, animated: false });
        }}
      >
        {options.map((option, index) => (
          <React.Fragment key={option.value}>
            {index > 0 && <View className="h-px bg-neutral-100" />}
            <Pressable
              onPress={() => onSelect(option.value)}
              className="flex-row items-center justify-between py-2.5"
            >
              <Typography
                weight="regular"
                className="text-body text-neutral-900"
              >
                {option.label}
              </Typography>
              {option.selected && (
                <StSvg
                  name="Done_round"
                  size={24}
                  color={colors.primary.blue[500]}
                />
              )}
            </Pressable>
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
};

const PresetPill = ({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) => (
  <View style={{ position: "relative" }}>
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        backgroundColor: colors.neutral[0],
        borderRadius: 10,
        paddingTop: 4,
        paddingRight: 8,
        paddingBottom: 5,
        paddingLeft: 9,
      }}
    >
      <Typography weight="semibold" className="text-body text-neutral-900">
        {label}
      </Typography>
      <StSvg
        name={open ? "Expand_up_light" : "Expand_down_light"}
        size={16}
        color={colors.neutral[900]}
      />
    </Pressable>
    {open && children}
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
  const [openPicker, setOpenPicker] = useState<"month" | "year" | null>(null);

  const visibleDate = new Date(visibleMonth);

  const monthOptions: Option[] = MONTHS.map((month) => ({
    label: formatMonthName(month),
    value: String(month.getMonth()),
    selected: month.getMonth() === visibleDate.getMonth(),
  }));

  const yearOptions: Option[] = YEARS.map((year) => ({
    label: String(year),
    value: String(year),
    selected: year === visibleDate.getFullYear(),
  }));

  const handleSelectMonth = (value: string) => {
    setVisibleMonth(formatApiDate(setMonth(visibleDate, Number(value))));
    setOpenPicker(null);
  };

  const handleSelectYear = (value: string) => {
    setVisibleMonth(formatApiDate(setYear(visibleDate, Number(value))));
    setOpenPicker(null);
  };

  return (
    <View className="mt-2">
      {header}
      <View style={{ position: "relative" }}>
        {enableYearPicker && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 16,
              marginBottom: 8,
              zIndex: 20,
            }}
          >
            <PresetPill
              label={formatDayMonthLong(visibleDate)}
              open={openPicker === "month"}
              onToggle={() =>
                setOpenPicker((prev) => (prev === "month" ? null : "month"))
              }
            >
              <OptionDropdown
                options={monthOptions}
                onSelect={handleSelectMonth}
              />
            </PresetPill>
            <PresetPill
              label={`${visibleDate.getFullYear()} год`}
              open={openPicker === "year"}
              onToggle={() =>
                setOpenPicker((prev) => (prev === "year" ? null : "year"))
              }
            >
              <OptionDropdown
                options={yearOptions}
                onSelect={handleSelectYear}
              />
            </PresetPill>
          </View>
        )}
        {openPicker && (
          <Pressable
            style={[StyleSheet.absoluteFillObject, { zIndex: 10 }]}
            onPress={() => setOpenPicker(null)}
          />
        )}
        <View style={{ minHeight: CALENDAR_MIN_HEIGHT }}>
          <Calendar
            key={visibleMonth}
            initialDate={visibleMonth}
            onDayPress={(day) => onDayPress(day.dateString)}
            onMonthChange={(month: DateData) =>
              setVisibleMonth(month.dateString)
            }
            markedDates={buildRangeMarks(start, end)}
            renderArrow={renderCalendarArrow}
            hideArrows={enableYearPicker}
            renderHeader={enableYearPicker ? () => null : undefined}
            hideExtraDays
            theme={rangeCalendarTheme}
          />
        </View>
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
