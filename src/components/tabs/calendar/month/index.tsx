import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { CircularProgressDay } from "@/src/components/tabs/calendar/month/CircularProgressDay";

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const MonthCalendarView = ({ selectedDate, onSelectDate }: Props) => {
  return (
    <Calendar
      firstDay={1}
      hideExtraDays={false}
      monthFormat={"MMMM yyyy"}
      theme={{
        calendarBackground: colors.background.surface,
        textSectionTitleColor: colors.neutral[400],
        todayTextColor: colors.primary?.blue[500],
        textDayFontFamily: "inter-regular",
      }}
      style={{
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "red",
      }}
      onDayPress={(day) => {
        onSelectDate(new Date(day.dateString));
      }}
      markedDates={{
        [format(selectedDate, "yyyy-MM-dd")]: {
          selected: true,
          selectedColor: "#3B82F6",
        },
      }}
      enableSwipeMonths={false}
      disableMonthChange
      dayComponent={({ date, state }) => {
        const isSelected =
          date?.dateString === format(selectedDate, "yyyy-MM-dd");

        const isDisabled = state === "disabled";

        return (
          <TouchableOpacity
            onPress={() => onSelectDate(new Date(date!.dateString))}
            className="relative items-center justify-center"
            style={{ width: 44, height: 44 }}
          >
            {!isDisabled && (
              <View className="absolute">
                <CircularProgressDay progress={0.3} isSelected={isSelected} />
              </View>
            )}

            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                isSelected ? "" : ""
              }`}
            >
              <Typography
                weight="regular"
                className={`
                text-[20px]
                ${
                  isSelected
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

export default MonthCalendarView;
