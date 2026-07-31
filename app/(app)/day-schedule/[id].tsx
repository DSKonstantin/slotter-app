import React from "react";
import { useLocalSearchParams } from "expo-router";
import CalendarDaySchedule from "@/src/components/app/calendar/daySchedule";

const DaySchedule = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <CalendarDaySchedule workingDayId={Number(id)} />;
};

export default DaySchedule;
