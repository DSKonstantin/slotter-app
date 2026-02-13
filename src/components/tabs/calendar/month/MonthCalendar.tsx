import React, { useMemo, useState } from "react";
import { View, TouchableOpacity, Pressable } from "react-native";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { CircularProgressDay } from "@/src/components/tabs/calendar/month/CircularProgressDay";

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const MonthCalendar = ({ selectedDate, onSelectDate }: Props) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const progressMap = useMemo(() => {
    const map: Record<string, number> = {};

    for (let i = 1; i <= 31; i++) {
      const key = format(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i),
        "yyyy-MM-dd",
      );

      map[key] = Math.floor(Math.random() * 10) / 10;
    }

    return map;
  }, [selectedDate]);

  return (
    <Calendar
      initialDate={format(currentMonth, "yyyy-MM-dd")}
      firstDay={1}
      hideArrows
      hideExtraDays={false}
      monthFormat={"MMMM yyyy"}
      onMonthChange={(month) => {
        setCurrentMonth(new Date(month.year, month.month - 1, 1));
      }}
      renderHeader={(date) => {
        return (
          <View className="flex-1 flex-row items-center justify-between pb-4">
            <View className="items-center flex-row gap-4">
              <Pressable
                onPress={() =>
                  setCurrentMonth(
                    new Date(date.getFullYear(), date.getMonth() - 1, 1),
                  )
                }
              >
                <StSvg
                  name="Expand_left"
                  size={24}
                  color={colors.neutral[500]}
                />
              </Pressable>

              <Typography className="text-body capitalize w-[125px] text-center">
                {format(date, "LLLL yyyy", { locale: ru })}
              </Typography>

              <Pressable
                onPress={() =>
                  setCurrentMonth(
                    new Date(date.getFullYear(), date.getMonth() + 1, 1),
                  )
                }
              >
                <StSvg
                  name="Expand_right"
                  size={24}
                  color={colors.neutral[500]}
                />
              </Pressable>
            </View>
            <Typography className="text-neutral-500">28 записей</Typography>
          </View>
        );
      }}
      theme={{
        calendarBackground: "transparent",
        textSectionTitleColor: colors.neutral[400],
        todayTextColor: colors.primary?.blue[500],
        textDayFontFamily: "inter-regular",
        textMonthFontFamily: "inter-medium",
        textMonthFontWeight: 500,
        textDayHeaderFontFamily: "inter-semibold",
        textDayHeaderFontSize: 16,
        monthTextColor: colors.neutral[900],
        textMonthFontSize: 16,
        ...calendarTheme,
      }}
      style={{
        paddingLeft: 0,
        paddingRight: 0,
      }}
      onDayPress={(day) => {
        onSelectDate(new Date(day.dateString));
      }}
      dayComponent={({ date, state }) => {
        const isToday = state === "today";
        const isDisabled = state === "disabled";
        const progress = date ? progressMap[date.dateString] : 0;

        return (
          <TouchableOpacity
            onPress={() => onSelectDate(new Date(date!.dateString))}
            className="relative items-center justify-center"
            style={{ width: 44, height: 44 }}
          >
            {!isDisabled && (
              <View className="absolute">
                <CircularProgressDay progress={progress} isSelected={isToday} />
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
                    : isDisabled
                      ? "text-neutral-300"
                      : "text-neutral-900"
                }`}
              >
                {date?.day}
              </Typography>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const calendarTheme = {
  "stylesheet.calendar.main": {
    monthView: {
      backgroundColor: "#FFFFFF",
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
  },
  "stylesheet.calendar.header": {
    week: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: "#FFFFFF",
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 8,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
  },
};

export default MonthCalendar;
