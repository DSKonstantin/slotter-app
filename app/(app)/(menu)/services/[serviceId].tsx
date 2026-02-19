import React from "react";
import { useLocalSearchParams } from "expo-router";
import ServiceFormScreen from "@/src/components/app/menu/services/serviceForm";

const ServiceEditPage = () => {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();

  return (
    <ServiceFormScreen
      title={`Редактировать услугу #${serviceId}`}
      initialValues={{
        name: `Услуга #${serviceId}`,
      }}
    />
  );
};

export default ServiceEditPage;
