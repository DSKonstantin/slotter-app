import React, { useEffect } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import AdditionalServicesForm from "@/src/components/app/menu/services/additionalServices/additionalServicesForm";
import { FormProvider, useForm } from "react-hook-form";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  useDeleteAdditionalServiceMutation,
  useGetAdditionalServiceQuery,
  useUpdateAdditionalServiceMutation,
} from "@/src/store/redux/services/api/servicesApi";
import { yupResolver } from "@hookform/resolvers/yup";
import { additionalServiceFormSchema } from "@/src/validation/schemas/additionalServiceForm.schema";
import { toast } from "@backpackapp-io/react-native-toast";
import { skipToken } from "@reduxjs/toolkit/query";
import { centsToRubles } from "@/src/utils/price/formatPrice";

const AdditionalServiceEdit = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const auth = useRequiredAuth();

  const methods = useForm({
    resolver: yupResolver(additionalServiceFormSchema),
    defaultValues: {
      name: "",
      price: "",
      duration: "",
      isActive: true,
    },
  });

  const {
    data: service,
    isLoading: isServiceLoading,
    isError,
  } = useGetAdditionalServiceQuery(
    auth?.userId && id ? { userId: auth.userId, id: id } : skipToken,
  );

  const [updateAdditionalService, { isLoading }] =
    useUpdateAdditionalServiceMutation();

  const [deleteAdditionalService] = useDeleteAdditionalServiceMutation();

  const handleDelete = () => {
    if (!auth?.userId) return;

    Alert.alert("Удалить доп. услугу?", "Это действие нельзя отменить", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAdditionalService({
              userId: auth.userId,
              id,
            }).unwrap();

            router.back();
          } catch (error: any) {
            toast.error(error?.data?.error || "Не удалось удалить доп. услугу");
          }
        },
      },
    ]);
  };

  const onSubmit = methods.handleSubmit(async (values) => {
    if (!auth?.userId) return;

    try {
      await updateAdditionalService({
        userId: auth.userId,
        id: Number(id),
        data: {
          name: values.name.trim(),
          duration: Number(values.duration),
          price: Number(values.price),
          is_active: values.isActive,
        },
      }).unwrap();

      router.back();
    } catch (error: any) {
      toast.error(error?.data?.error || "Не удалось изменить доп. услугу");
    }
  });

  useEffect(() => {
    if (!service) return;

    methods.reset({
      name: service.name,
      price: String(centsToRubles(service.price_cents)),
      duration: String(service.duration),
      isActive: service.is_active,
    });
  }, [service, methods]);

  if (!auth) return null;

  if (isServiceLoading) {
    return (
      <ScreenWithToolbar title="Редактировать доп. услугу">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenWithToolbar>
    );
  }

  if (isError || !service) {
    return (
      <ScreenWithToolbar title="Редактировать доп. услугу">
        <View className="flex-1 items-center justify-center">
          <View>Ошибка загрузки</View>
        </View>
      </ScreenWithToolbar>
    );
  }

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Редактировать доп. услугу">
        {(insets) => (
          <AdditionalServicesForm
            insets={insets}
            loading={isLoading}
            onSubmit={onSubmit}
            isEdit
            onDelete={handleDelete}
          />
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default AdditionalServiceEdit;
