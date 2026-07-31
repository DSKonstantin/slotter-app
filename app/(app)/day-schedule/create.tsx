import React from "react";
import { useLocalSearchParams } from "expo-router";
import CalendarDayScheduleCreate from "@/src/components/app/calendar/daySchedule/DayScheduleCreate";

const DayScheduleCreate = () => {
  const { date } = useLocalSearchParams<{ date: string }>();
  return <CalendarDayScheduleCreate date={date} />;
};

export default DayScheduleCreate;
