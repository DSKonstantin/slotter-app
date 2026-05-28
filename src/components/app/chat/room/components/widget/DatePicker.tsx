import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { eachDayOfInterval, endOfMonth, parseISO, startOfMonth } from "date-fns";
import { Calendar } from "react-native-calendars";
import { colors } from "@/src/styles/colors";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { pickerCalendarTheme } from "@/src/styles/calendarTheme";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import RetryInline from "@/src/components/shared/retryInline";

type Props = {
  userId: number;
  onPick: (date: string) => void;
};

const DatePicker = ({ userId, onPick }: Props) => {
  const today = formatApiDate(new Date());

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return {
      date_from: formatApiDate(startOfMonth(now)),
      date_to: formatApiDate(endOfMonth(now)),
    };
  });

  const {
    data: workingDaysData,
    isLoading,
    isError,
    refetch,
  } = useGetWorkingDaysQuery({ userId, ...visibleMonth });

  const handleMonthChange = useCallback(
    (month: { year: number; month: number }) => {
      const date = new Date(month.year, month.month - 1, 1);
      setVisibleMonth({
        date_from: formatApiDate(startOfMonth(date)),
        date_to: formatApiDate(endOfMonth(date)),
      });
    },
    [],
  );

  const markedDates = useMemo(() => {
    if (!workingDaysData) return {};
    const days = eachDayOfInterval({
      start: parseISO(visibleMonth.date_from),
      end: parseISO(visibleMonth.date_to),
    });
    return days.reduce<Record<string, { disabled?: boolean }>>((acc, d) => {
      const dateStr = formatApiDate(d);
      const wd = workingDaysData[dateStr];
      acc[dateStr] = wd?.is_active ? {} : { disabled: true };
      return acc;
    }, {});
  }, [workingDaysData, visibleMonth]);

  if (isLoading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color={colors.neutral[400]} />
      </View>
    );
  }

  if (isError && !workingDaysData) {
    return (
      <View className="py-6">
        <RetryInline
          text="Не удалось загрузить рабочие дни"
          onRetry={refetch}
          layout="column"
        />
      </View>
    );
  }

  return (
    <Calendar
      minDate={today}
      markedDates={markedDates}
      onDayPress={(day) => {
        if (!markedDates[day.dateString]?.disabled) {
          onPick(day.dateString);
        }
      }}
      onMonthChange={handleMonthChange}
      disableAllTouchEventsForDisabledDays
      theme={pickerCalendarTheme}
    />
  );
};

export default DatePicker;
