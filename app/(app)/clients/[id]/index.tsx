import React from "react";
import { useLocalSearchParams } from "expo-router";
import ClientDetail from "@/src/components/app/clients/clientDetail";

const ClientDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ClientDetail customerId={Number(id)} />;
};

export default ClientDetailScreen;
