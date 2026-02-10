import React from "react";
import DateSelector from "@/src/components/tabs/calendar/day/DateSelector";
import { View } from "react-native";
import TimeSlotList from "@/src/components/tabs/calendar/day/TimeSlotList";

const DayCalendarView = () => {
  return (
    <View className="flex-1 mt-4">
      <DateSelector selectedDate={new Date()} onSelectDate={() => {}} />
      <TimeSlotList />
    </View>
  );
};

export default DayCalendarView;
