import React from "react";
import { useLocalSearchParams } from "expo-router";
import SlotSelectService from "@/src/components/app/calendar/slot/slotSelectService";

const SlotSelectServiceScreen = () => {
  const {
    date,
    time,
    appointmentId,
    duration,
    selectedServiceIds,
    selectedAdditionalServiceIds,
    mode,
  } = useLocalSearchParams<{
    date?: string;
    time?: string;
    appointmentId?: string;
    duration?: string;
    selectedServiceIds?: string;
    selectedAdditionalServiceIds?: string;
    mode?: "services" | "additional";
  }>();
  return (
    <SlotSelectService
      date={date}
      time={time}
      appointmentId={appointmentId}
      duration={duration}
      selectedServiceIds={selectedServiceIds}
      selectedAdditionalServiceIds={selectedAdditionalServiceIds}
      mode={mode}
    />
  );
};

export default SlotSelectServiceScreen;
