import React from "react";
import { useLocalSearchParams } from "expo-router";
import SlotSelectService from "@/src/components/app/calendar/slot/slotSelectService";

const SlotSelectServiceScreen = () => {
  const { date, time, appointmentId, selectedServiceIds } =
    useLocalSearchParams<{
      date?: string;
      time?: string;
      appointmentId?: string;
      selectedServiceIds?: string;
    }>();
  return (
    <SlotSelectService
      date={date}
      time={time}
      appointmentId={appointmentId}
      selectedServiceIds={selectedServiceIds}
    />
  );
};

export default SlotSelectServiceScreen;
