import React from "react";
import { useLocalSearchParams } from "expo-router";
import ClientConsents from "@/src/components/app/clients/clientDetail/clientConsents";

const ClientConsentsScreen = () => {
  const { id, kind } = useLocalSearchParams<{ id: string; kind?: string }>();
  return kind === "customer" ? (
    <ClientConsents customerId={Number(id)} />
  ) : (
    <ClientConsents userCustomerId={Number(id)} />
  );
};

export default ClientConsentsScreen;
