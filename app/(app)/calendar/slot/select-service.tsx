import React from "react";
import { useLocalSearchParams } from "expo-router";
import SlotSelectService from "@/src/components/app/calendar/slot/slotSelectService";

const SlotSelectServiceScreen = () => {
  const { date, time } = useLocalSearchParams<{
    date?: string;
    time?: string;
  }>();
  return <SlotSelectService date={date} time={time} />;
};

export default SlotSelectServiceScreen;
