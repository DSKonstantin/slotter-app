import React from "react";
import { useLocalSearchParams } from "expo-router";
import ClientStatistics from "@/src/components/app/clients/clientDetail/statistics";

const ClientStatisticsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ClientStatistics customerId={Number(id)} />;
};

export default ClientStatisticsScreen;
