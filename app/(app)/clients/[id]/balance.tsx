import React from "react";
import { useLocalSearchParams } from "expo-router";
import ClientBalance from "@/src/components/app/clients/clientDetail/balance";

const ClientBalanceScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ClientBalance customerId={Number(id)} />;
};

export default ClientBalanceScreen;
