import React from "react";
import { useLocalSearchParams } from "expo-router";
import BroadcastDetail from "@/src/components/app/clients/broadcast/BroadcastDetail";

const BroadcastDetailPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BroadcastDetail broadcastId={Number(id)} />;
};

export default BroadcastDetailPage;
