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

const MonthCalendarView = ({ selectedDate, onSelectDate }: Props) => {
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
  }, [currentMonth]);

  return (
    <Calendar
      initialDate={format(currentMonth, "yyyy-MM-dd")}
      firstDay={1}
      hideArrows
      hideExtraDays={false}
      monthFormat={"MMMM yyyy"}
      renderArrow={(direction) => (
        <Typography>{direction === "left" ? "‹" : "›"}</Typography>
      )}
      onMonthChange={(month) => {
        setCurrentMonth(new Date(month.year, month.month - 1, 1));
      }}
      renderHeader={(date) => {
        return (
          <View className="flex-1 flex-row items-center justify-between mb-4">
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
      // customHeader={(props) => {
      //   console.log(props.onPressArrowLeft, "propspropsprops");
      //
      //   return (
      //     <View className="py-2">
      //       <Pressable
      //         style={{ height: 30, backgroundColor: "green", width: 300 }}
      //         onPress={() => props.onPressArrowLeft?.()}
      //       >
      //
      //       </Pressable>
      //     </View>
      //   );
      // }}
      // customHeaderTitle={(props) => {}}
      theme={{
        calendarBackground: "transparent",
        textSectionTitleColor: colors.neutral[400],
        todayTextColor: colors.primary?.blue[500],
        textDayFontFamily: "inter-regular",
        textMonthFontFamily: "inter-medium",
        textMonthFontWeight: 500,
        textDayHeaderFontSize: 13,
        monthTextColor: colors.neutral[900],
        textMonthFontSize: 16,
        "stylesheet.calendar.header": {
          week: {
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: "#FFFFFF",
            // borderTopRadius: 16,
            // paddingVertical: 8,
            // marginBottom: 8,
          },
        },
      }}
      style={
        {
          // overflow: "hidden",
          // backgroundColor: "green",
        }
      }
      onDayPress={(day) => {
        onSelectDate(new Date(day.dateString));
      }}
      markedDates={{
        [format(selectedDate, "yyyy-MM-dd")]: {
          selected: true,
          selectedColor: "#3B82F6",
        },
      }}
      dayComponent={({ date, state }) => {
        const isSelected =
          date?.dateString === format(selectedDate, "yyyy-MM-dd");

        const progress = progressMap[date.dateString] ?? 0;
        const isDisabled = state === "disabled";

        return (
          <TouchableOpacity
            onPress={() => onSelectDate(new Date(date!.dateString))}
            className="relative items-center justify-center"
            style={{ width: 44, height: 44 }}
          >
            {!isDisabled && (
              <View className="absolute">
                <CircularProgressDay
                  progress={progress}
                  // progress={0.5}
                  isSelected={isSelected}
                />
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
