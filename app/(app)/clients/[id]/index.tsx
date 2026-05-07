import React from "react";
import { useLocalSearchParams } from "expo-router";
import ClientDetail from "@/src/components/app/clients/clientDetail";

const ClientDetailScreen = () => {
  const { id, kind } = useLocalSearchParams<{ id: string; kind?: string }>();
  return kind === "customer" ? (
    <ClientDetail customerId={Number(id)} />
  ) : (
    <ClientDetail userCustomerId={Number(id)} />
  );
};

export default ClientDetailScreen;
