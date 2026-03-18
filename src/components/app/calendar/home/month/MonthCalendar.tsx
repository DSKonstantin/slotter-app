import React, { useCallback } from "react";
import { View, TouchableOpacity, Pressable } from "react-native";
import { Calendar } from "react-native-calendars";
import { formatApiDate, formatMonthYear } from "@/src/utils/date/formatDate";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { calendarTheme, calendarStyle } from "@/src/styles/calendarTheme";
import { CircularProgressDay } from "@/src/components/app/calendar/home/month/CircularProgressDay";

interface MonthCalendarData {
  progressMap: Record<string, number>;
  nonWorkingDays: Set<string>;
  totalAppointments: number;
  isLoading?: boolean;
}

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  data: MonthCalendarData;
}

const MonthCalendar = ({
  selectedDate,
  onSelectDate,
  currentMonth,
  onMonthChange,
  data,
}: Props) => {
  const {
    progressMap,
    nonWorkingDays,
    totalAppointments: appointmentCount,
    isLoading = false,
  } = data;

  const handleMonthChange = useCallback(
    (month: any) => {
      const date = new Date(month.year, month.month - 1, 1);
      onMonthChange(date);
    },
    [onMonthChange],
  );

  const renderHeader = useCallback(
    (date: any) => {
      return (
        <View className="flex-1 flex-row items-center justify-between pb-4">
          <View className="items-center flex-row gap-4">
            <Pressable
              disabled={isLoading}
              onPress={() =>
                handleMonthChange({
                  year: date.getFullYear(),
                  month: date.getMonth(),
                })
              }
            >
              <StSvg
                name="Expand_left"
                size={24}
                color={isLoading ? colors.neutral[300] : colors.neutral[500]}
              />
            </Pressable>

            <Typography className="text-body capitalize w-[125px] text-center">
              {formatMonthYear(date)}
            </Typography>

            <Pressable
              disabled={isLoading}
              onPress={() =>
                handleMonthChange({
                  year: date.getFullYear(),
                  month: date.getMonth() + 2,
                })
              }
            >
              <StSvg
                name="Expand_right"
                size={24}
                color={isLoading ? colors.neutral[300] : colors.neutral[500]}
              />
            </Pressable>
          </View>
          <Typography className="text-neutral-500">
            {isLoading ? "—" : `${appointmentCount} записей`}
          </Typography>
        </View>
      );
    },
    [appointmentCount, handleMonthChange, isLoading],
  );

  const handleDayPress = useCallback(
    (day: any) => {
      onSelectDate(new Date(day.dateString));
    },
    [onSelectDate],
  );

  const renderDay = useCallback(
    ({ date, state }: any) => {
      const isToday = state === "today";
      const isDisabled = state === "disabled";
      const isNonWorking =
        !isLoading && !isDisabled && date
          ? nonWorkingDays.has(date.dateString)
          : false;
      const progress = date ? progressMap[date.dateString] : undefined;
      const showProgress =
        !isDisabled && date && !isLoading && progress !== undefined;

      return (
        <TouchableOpacity
          onPress={() => handleDayPress(date)}
          className="relative items-center justify-center w-[44px] h-[44px]"
          disabled={!date}
        >
          {showProgress && (
            <View className="absolute">
              <CircularProgressDay progress={progress} />
            </View>
          )}

          <View className="w-8 h-8 rounded-full items-center justify-center">
            <Typography
              weight="regular"
              className={`
              text-[20px]
              ${
                isToday
                  ? "text-primary-blue-500"
                  : isDisabled || isNonWorking
                    ? "text-neutral-300"
                    : "text-neutral-900"
              }`}
            >
              {date?.day}
            </Typography>
          </View>
        </TouchableOpacity>
      );
    },
    [handleDayPress, progressMap, nonWorkingDays, isLoading],
  );

  return (
    <Calendar
      initialDate={formatApiDate(currentMonth)}
      firstDay={1}
      hideArrows
      hideExtraDays={true}
      monthFormat={"MMMM yyyy"}
      onMonthChange={handleMonthChange}
      renderHeader={renderHeader}
      theme={calendarTheme}
      style={calendarStyle.calendar}
      onDayPress={handleDayPress}
      dayComponent={renderDay}
    />
  );
};

export default MonthCalendar;
