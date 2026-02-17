import React, { useMemo, useState } from "react";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import ScheduleDayCard from "@/src/components/shared/cards/scheduleDayCard";
import { View } from "react-native";
import {
  format,
  startOfMonth,
  endOfMonth,
  addDays,
  getDate,
  getYear,
  getMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { TAB_BAR_HEIGHT, TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

type DayItem = {
  date: Date;
  hasSchedule?: boolean;
  isSelected?: boolean;
};

const generateMonth = (year: number, month: number): DayItem[] => {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(start);

  const days: DayItem[] = [];

  const totalDays = getDate(end);

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(start, i);

    days.push({
      date,
      hasSchedule: [3, 4, 5, 6].includes(getDate(date)),
      isSelected: [11, 12, 13, 15].includes(getDate(date)),
    });
  }

  return days;
};

const CalendarSchedule = () => {
  const [current, setCurrent] = useState(new Date());
  const { top, bottom } = useSafeAreaInsets();

  const days = useMemo(
    () => generateMonth(getYear(current), getMonth(current)),
    [current],
  );

  const renderItem = ({ item }: { item: DayItem }) => {
    return (
      <View className="m-1">
        <ScheduleDayCard
          date={item.date}
          hasSchedule={item.hasSchedule}
          isSelected={item.isSelected}
          showCheckbox={!item.hasSchedule}
          onPress={() => {
            console.log("Pressed:", item.date);
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1" edges={["left", "right"]}>
      <ToolbarTop
        title="График"
        rightButton={
          <IconButton
            icon={<StSvg name="Time" size={28} color={colors.neutral[900]} />}
            onPress={() => {}}
          />
        }
      />
      <View
        className="flex-1"
        style={{
          marginTop: TOOLBAR_HEIGHT + top,
        }}
      >
        <View className="items-center mb-4 px-screen">
          <View className="flex-row items-center bg-background-surface rounded-full px-4 py-2 gap-4">
            <IconButton
              size="xs"
              icon={
                <StSvg
                  name="Expand_left"
                  size={24}
                  color={colors.neutral[500]}
                />
              }
              onPress={() => setCurrent((prev) => subMonths(prev, 1))}
            />

            <Typography
              weight="semibold"
              className="text-body capitalize w-[125px] text-center"
            >
              {format(current, "LLLL yyyy", { locale: ru })}
            </Typography>

            <IconButton
              size="xs"
              icon={
                <StSvg
                  name="Expand_right"
                  size={24}
                  color={colors.neutral[500]}
                />
              }
              onPress={() => setCurrent((prev) => addMonths(prev, 1))}
            />
          </View>
        </View>

        <FlashList
          data={days}
          numColumns={3}
          keyExtractor={(item) => item.date.toISOString()}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: TAB_BAR_HEIGHT + bottom + 16,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default CalendarSchedule;
