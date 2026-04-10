import React from "react";
import { useLocalSearchParams } from "expo-router";
import ClientHistory from "@/src/components/app/clients/clientDetail/history";

const ClientHistoryScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ClientHistory customerId={Number(id)} />;
};

export default ClientHistoryScreen;
