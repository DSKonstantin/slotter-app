import React from "react";
import { useLocalSearchParams } from "expo-router";
import EditService from "@/src/components/app/menu/services/service/edit";

const ServiceEditPage = () => {
  const { serviceId, categoryId } = useLocalSearchParams<{
    serviceId: string;
    categoryId?: string;
  }>();

  return <EditService serviceId={serviceId} categoryId={categoryId} />;
};

export default ServiceEditPage;
