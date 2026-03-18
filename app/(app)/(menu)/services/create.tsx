import React from "react";
import { useLocalSearchParams } from "expo-router";
import AppCreateService from "@/src/components/app/menu/services/service/create";

const Create = () => {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  return <AppCreateService categoryId={categoryId} />;
};

export default Create;
