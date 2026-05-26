import React from "react";
import { useLocalSearchParams } from "expo-router";
import SlotDetails from "@/src/components/app/calendar/slot/slotDetails";

const SlotDetailScreen = () => {
  const { slotId } = useLocalSearchParams<{ slotId: string }>();
  return <SlotDetails slotId={slotId} />;
};

export default SlotDetailScreen;
