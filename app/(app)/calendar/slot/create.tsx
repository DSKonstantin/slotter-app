import React from "react";
import { useLocalSearchParams } from "expo-router";
import SlotCreate from "@/src/components/app/calendar/slot/slotCreate";

const SlotCreateScreen = () => {
  const { date, time, serviceId, serviceName } = useLocalSearchParams<{
    date?: string;
    time?: string;
    serviceId?: string;
    serviceName?: string;
  }>();
  return (
    <SlotCreate
      date={date}
      time={time}
      serviceId={serviceId}
      serviceName={serviceName}
    />
  );
};

export default SlotCreateScreen;
