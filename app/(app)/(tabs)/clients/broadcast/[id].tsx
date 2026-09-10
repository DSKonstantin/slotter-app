import React from "react";
import { useLocalSearchParams } from "expo-router";
import BroadcastForm from "@/src/components/app/clients/broadcast/BroadcastForm";

const BroadcastEditPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BroadcastForm broadcastId={id} />;
};

export default BroadcastEditPage;
