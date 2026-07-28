import React from "react";
import { useLocalSearchParams } from "expo-router";
import SlotDetails from "@/src/components/app/calendar/slot/slotDetails";

const SlotDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SlotDetails slotId={id} />;
};

export default SlotDetailScreen;
