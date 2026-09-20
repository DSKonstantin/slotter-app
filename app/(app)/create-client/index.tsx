import React from "react";
import { useLocalSearchParams } from "expo-router";
import SlotClientCreate from "@/src/components/app/calendar/slot/slotClientCreate";

const CreateClientScreen = () => {
  const { name } = useLocalSearchParams<{ name?: string }>();

  return <SlotClientCreate initialName={name} />;
};

export default CreateClientScreen;
