import React, { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { addDays } from "date-fns";
import { Calendar } from "react-native-calendars";
import { Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { pickerCalendarTheme } from "@/src/styles/calendarTheme";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import RetryInline from "@/src/components/shared/retryInline";

const DATE_RANGE_DAYS = 60;

type Props = {
  userId: number;
  onPick: (date: string) => void;
};

const DatePicker = ({ userId, onPick }: Props) => {
  const today = formatApiDate(new Date());

  const dateRange = useMemo(
    () => ({
      date_from: today,
      date_to: formatApiDate(addDays(new Date(), DATE_RANGE_DAYS)),
    }),
    [today],
  );

  const {
    data: workingDaysData,
    isLoading,
    isError,
    refetch,
  } = useGetWorkingDaysQuery({ userId, ...dateRange });

  const markedDates = useMemo(() => {
    if (!workingDaysData) return {};
    return Object.entries(workingDaysData).reduce<
      Record<string, { marked: boolean; dotColor: string; disabled?: boolean }>
    >((acc, [date, wd]) => {
      if (wd?.is_active && date >= today) {
        acc[date] = { marked: true, dotColor: colors.primary.blue[500] };
      }
      return acc;
    }, {});
  }, [workingDaysData, today]);

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

  if (Object.keys(markedDates).length === 0) {
    return (
      <View className="items-center py-6">
        <Typography className="text-neutral-400">
          Нет доступных рабочих дней
        </Typography>
      </View>
    );
  }

  return (
    <Calendar
      minDate={today}
      maxDate={dateRange.date_to}
      markedDates={markedDates}
      onDayPress={(day) => {
        if (markedDates[day.dateString]) {
          onPick(day.dateString);
        }
      }}
      disableAllTouchEventsForDisabledDays
      theme={pickerCalendarTheme}
    />
  );
};

export default DatePicker;
