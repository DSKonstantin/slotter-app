import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { colors } from "@/src/styles/colors";
import { pickerCalendarTheme } from "@/src/styles/calendarTheme";
import {
  useWorkingDaysCalendar,
  type WorkingDayStatus,
} from "@/src/hooks/useWorkingDaysCalendar";
import RetryInline from "@/src/components/shared/retryInline";

type Props = {
  userId: number;
  currentMonth?: string;
  onPick: (date: string) => void;
  onNonWorkingDayPress?: (
    date: string,
    status: Exclude<WorkingDayStatus, "working">,
    workingDayId?: number,
  ) => void;
  onMonthChange?: (month: string) => void;
};

const DatePicker = ({
  userId,
  currentMonth,
  onPick,
  onNonWorkingDayPress,
  onMonthChange: onMonthChangeProp,
}: Props) => {
  const {
    markedDates,
    isLoading,
    isError,
    refetch,
    onMonthChange,
    minDate,
    getDayStatus,
    getWorkingDayId,
  } = useWorkingDaysCalendar(userId);

  if (isLoading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color={colors.neutral[400]} />
      </View>
    );
  }

  if (isError) {
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

  const handleDayPress = (day: { dateString: string }) => {
    if (onNonWorkingDayPress) {
      const status = getDayStatus(day.dateString);
      if (status !== "working") {
        onNonWorkingDayPress(day.dateString, status, getWorkingDayId(day.dateString));
        return;
      }
    } else if (markedDates[day.dateString]?.disabled) {
      return;
    }
    onPick(day.dateString);
  };

  return (
    <Calendar
      current={currentMonth}
      minDate={minDate}
      markedDates={markedDates}
      onDayPress={handleDayPress}
      onMonthChange={(month) => {
        onMonthChange(month);
        onMonthChangeProp?.(month.dateString);
      }}
      disableAllTouchEventsForDisabledDays={!onNonWorkingDayPress}
      theme={pickerCalendarTheme}
    />
  );
};

export default DatePicker;
