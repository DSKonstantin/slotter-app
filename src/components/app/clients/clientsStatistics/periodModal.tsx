import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { Calendar } from "react-native-calendars";
import {
  formatApiDate,
  formatDayMonthLong,
  formatDayMonthYearLong,
} from "@/src/utils/date/formatDate";
import { Divider, Item, StModal, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { pickerCalendarTheme } from "@/src/styles/calendarTheme";

export const PERIODS = [
  { label: "Сегодня", value: "1d" },
  { label: "Текущая неделя", value: "7d" },
  { label: "Текущий месяц", value: "30d" },
  { label: "Последние 30 дней", value: "30d_last" },
];

export const CUSTOM_PERIOD_VALUE = "custom";

const today = formatApiDate(new Date());

function buildRangeMarks(start: string | null, end: string | null) {
  const marks: Record<string, object> = {};
  if (!start) return marks;

  marks[start] = { selected: true, selectedColor: colors.primary.blue[500] };

  if (!end || end === start) return marks;

  let current = formatApiDate(new Date(new Date(start).getTime() + 86400000));
  while (current < end) {
    if (current === today) {
      marks[current] = {
        selected: true,
        selectedColor: colors.primary.blue[100],
        selectedTextColor: colors.primary.blue[500],
      };
    } else {
      marks[current] = {
        selected: true,
        selectedColor: colors.primary.blue[100],
        selectedTextColor: colors.neutral[900],
      };
    }
    current = formatApiDate(new Date(new Date(current).getTime() + 86400000));
  }

  marks[end] = { selected: true, selectedColor: colors.primary.blue[500] };

  return marks;
}

export type Period =
  | (typeof PERIODS)[number]
  | { label: string; value: typeof CUSTOM_PERIOD_VALUE };

type Props = {
  visible: boolean;
  selectedPeriod: Period;
  onClose: () => void;
  onSelectPeriod: (period: Period) => void;
};

const PeriodModal = ({
  visible,
  selectedPeriod,
  onClose,
  onSelectPeriod,
}: Props) => {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  const handleSelectPeriod = (period: Period) => {
    setCalendarVisible(false);
    onSelectPeriod(period);
  };

  const handleDayPress = (dateString: string) => {
    if (rangeEnd && dateString === rangeEnd) {
      setRangeEnd(null);
      return;
    }

    if (rangeStart && dateString === rangeStart) {
      setRangeStart(null);
      setRangeEnd(null);
      return;
    }

    if (!rangeStart || rangeEnd) {
      setRangeStart(dateString);
      setRangeEnd(null);
      return;
    }

    const [start, end] =
      dateString < rangeStart
        ? [dateString, rangeStart]
        : [rangeStart, dateString];
    setRangeEnd(end);
    const label =
      start === end
        ? formatDayMonthYearLong(new Date(start))
        : `${formatDayMonthLong(new Date(start))} — ${formatDayMonthYearLong(new Date(end))}`;
    onSelectPeriod({ label, value: CUSTOM_PERIOD_VALUE });
  };

  const markedDates = useMemo(
    () => buildRangeMarks(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  );

  return (
    <StModal visible={visible} onClose={onClose}>
      <Typography weight="semibold" className="text-display text-center">
        Выберите период
      </Typography>
      <View className="gap-2 mt-6 bg-background-surface p-4 rounded-base">
        {PERIODS.map((period, index) => (
          <React.Fragment key={period.value}>
            <Item
              title={period.label}
              active={selectedPeriod.value === period.value}
              className="border-transparent rounded-none min-h-[24px] p-0"
              onPress={() => handleSelectPeriod(period)}
            />
            {index < PERIODS.length - 1 && <Divider className="my-2" />}
          </React.Fragment>
        ))}
        <Divider className="my-2" />
        <Item
          title="Выбрать другой период..."
          active={selectedPeriod.value === CUSTOM_PERIOD_VALUE}
          className="border-transparent rounded-none min-h-[24px] p-0"
          onPress={() => setCalendarVisible(true)}
        />

        {calendarVisible && (
          <View
            style={{
              minHeight: 340,
            }}
          >
            <Calendar
              current={rangeStart ?? formatApiDate(new Date())}
              onDayPress={(day) => handleDayPress(day.dateString)}
              markedDates={markedDates}
              hideExtraDays
              theme={pickerCalendarTheme}
            />
          </View>
        )}
      </View>
    </StModal>
  );
};

export default PeriodModal;
