import React, { useState } from "react";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import {
  IconButton,
  SegmentedControl,
  StSvg,
  Button,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { TAB_BAR_HEIGHT, TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import DateSelector from "./day/DateSelector";
import TimeSlotList from "./day/TimeSlotList";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import CalendarActionButton from "@/src/components/tabs/calendar/сalendarActionButton";
import MonthCalendarView from "@/src/components/tabs/calendar/month";

const TabCalendar = () => {
  const router = useRouter();
  const { mode, date } = useLocalSearchParams<{
    mode?: string;
    date?: string;
  }>();

  const { bottom, top, left, right } = useSafeAreaInsets();
  const selectedDate = date ? new Date(date) : new Date();

  const handleSelectDate = (newDate: Date) => {
    router.setParams({
      mode: mode ?? "day",
      date: newDate.toISOString(),
    });
  };

  return (
    <>
      <ToolbarTop
        title="Календарь"
        rightButton={
          <IconButton
            icon={
              <StSvg
                name="Filter_alt_fill"
                size={28}
                color={colors.neutral[900]}
              />
            }
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
        <View className="flex-1 mt-4 gap-4">
          <SegmentedControl
            className="mx-screen"
            value={mode === "month" ? "month" : "day"}
            onChange={(value) => {
              router.setParams({
                mode: value,
                date: selectedDate.toISOString(),
              });
            }}
            options={[
              { label: "День", value: "day" },
              { label: "Месяц", value: "month" },
            ]}
          />
          {mode === "month" ? (
            <View className="px-screen">
              <MonthCalendarView
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </View>
          ) : (
            <>
              <DateSelector
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
              <TimeSlotList />
            </>
          )}
        </View>
      </View>
      <CalendarActionButton
        mode={mode}
        onPress={() => {
          if (mode === "month") {
          } else {
          }
        }}
      />
    </>
  );
};

export default TabCalendar;
