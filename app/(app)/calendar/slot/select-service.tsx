import React from "react";
import { useLocalSearchParams } from "expo-router";
import SlotSelectService from "@/src/components/app/calendar/slot/slotSelectService";

const SlotSelectServiceScreen = () => {
  const {
    date,
    time,
    appointmentId,
    selectedServiceIds,
    selectedAdditionalServiceIds,
  } = useLocalSearchParams<{
    date?: string;
    time?: string;
    appointmentId?: string;
    selectedServiceIds?: string;
    selectedAdditionalServiceIds?: string;
  }>();
  return (
    <SlotSelectService
      date={date}
      time={time}
      appointmentId={appointmentId}
      selectedServiceIds={selectedServiceIds}
      selectedAdditionalServiceIds={selectedAdditionalServiceIds}
    />
  );
};

export default SlotSelectServiceScreen;
