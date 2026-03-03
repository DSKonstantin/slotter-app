import React, { useEffect } from "react";
import { StModal } from "@/src/components/ui";
import { Alert } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import AdditionalServicesForm from "@/src/components/app/menu/services/additionalServices/additionalServicesForm";
import {
  useDeleteAdditionalServiceMutation,
  useUpdateAdditionalServiceMutation,
} from "@/src/store/redux/services/api/servicesApi";
import { toast } from "@backpackapp-io/react-native-toast";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { centsToRubles } from "@/src/utils/price/formatPrice";

type AdditionalServiceFormValues = {
  name: string;
  description: string;
  price: string;
  duration: string;
  isActive: boolean;
};

type Props = {
  visible: boolean;
  service?: {
    id: number;
    name: string;
    description?: string;
    price_cents: number;
    duration: number;
    is_active: boolean;
  } | null;
  onClose: () => void;
};

const EditAdditionalServiceModal = ({ visible, service, onClose }: Props) => {
  const auth = useRequiredAuth();
  const [updateAdditionalService, { isLoading: isUpdating }] =
    useUpdateAdditionalServiceMutation();

  const [deleteAdditionalService, { isLoading: isDeleting }] =
    useDeleteAdditionalServiceMutation();

  const methods = useForm<AdditionalServiceFormValues>({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      duration: "",
      isActive: true,
    },
  });

  const { reset, handleSubmit } = methods;

  const onSubmit = handleSubmit(async (values) => {
    if (!auth?.userId || !service?.id) return;

    try {
      await updateAdditionalService({
        userId: auth.userId,
        id: service.id,
        data: {
          name: values.name.trim(),
          duration: Number(values.duration),
          price: Number(values.price),
          is_active: values.isActive,
        },
      }).unwrap();

      onClose();
    } catch (error: any) {
      toast.error(error?.data?.error || "Не удалось обновить доп. услугу");
    }
  });

  const handleDelete = () => {
    if (!auth?.userId || !service?.id) return;

    Alert.alert("Удалить доп. услугу?", "Это действие нельзя отменить", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAdditionalService({
              userId: auth.userId,
              id: service.id,
            }).unwrap();

            toast.success("Доп. услуга удалена");
            onClose();
          } catch (error: any) {
            toast.error(error?.data?.error || "Не удалось удалить доп. услугу");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (!service) {
      reset({
        name: "",
        description: "",
        price: "",
        duration: "",
        isActive: true,
      });
      return;
    }

    reset({
      name: service.name ?? "",
      description: service.description ?? "",
      price: String(centsToRubles(service.price_cents)),
      duration: String(service.duration),
      isActive: service.is_active ?? true,
    });
  }, [service, reset]);

  if (!auth) return null;

  return (
    <StModal visible={visible} onClose={onClose} horizontalPadding={false}>
      <FormProvider {...methods}>
        <AdditionalServicesForm
          insets={{
            topInset: 0,
            bottomInset: 0,
          }}
          loading={isUpdating || isDeleting}
          onSubmit={onSubmit}
          onDelete={handleDelete}
          isEdit
        />
      </FormProvider>
    </StModal>
  );
};

export default EditAdditionalServiceModal;
