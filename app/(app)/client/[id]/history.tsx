import React from "react";
import { useLocalSearchParams } from "expo-router";
import ClientHistory from "@/src/components/app/clients/clientDetail/history";

const ClientHistoryScreen = () => {
  const { id, kind } = useLocalSearchParams<{ id: string; kind?: string }>();
  return kind === "customer" ? (
    <ClientHistory customerId={Number(id)} />
  ) : (
    <ClientHistory userCustomerId={Number(id)} />
  );
};

export default ClientHistoryScreen;
