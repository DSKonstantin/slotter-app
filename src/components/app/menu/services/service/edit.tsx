import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import ServiceFormBody, {
  defaultServicePhotos,
} from "@/src/components/app/menu/services/service/serviceForm";
import { Typography } from "@/src/components/ui";
import {
  useDeleteServiceMutation,
  useGetServiceQuery,
  useUpdateServiceMutation,
} from "@/src/store/redux/services/api/servicesApi";
import { createEmptyPhotoSlot } from "@/src/components/shared/imagePicker/serviceImagesPicker";
import { appendPhotosToFormData } from "@/src/utils/appendPhotosToFormData";
import { buildServiceFormData } from "@/src/utils/formData/buildServiceFormData";
import { toast } from "@backpackapp-io/react-native-toast";
import { serviceFormSchema } from "@/src/validation/schemas/serviceForm.schema";
import { centsToRubles } from "@/src/utils/price/formatPrice";
import { getApiErrorMessage } from "@/src/utils/apiError";

type EditServiceProps = {
  serviceId: number;
  categoryId: number;
};

const EditService = ({ serviceId, categoryId }: EditServiceProps) => {
  const router = useRouter();
  const [updateService, { isLoading }] = useUpdateServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();
  const hasValidIds =
    Number.isFinite(serviceId) &&
    Number.isFinite(categoryId) &&
    serviceId > 0 &&
    categoryId > 0;

  const {
    data: service,
    isLoading: isServiceLoading,
    isFetching: isServiceFetching,
    isError: isServiceError,
  } = useGetServiceQuery(
    hasValidIds
      ? {
          categoryId,
          id: serviceId,
        }
      : skipToken,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const methods = useForm({
    resolver: yupResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      price: "",
      duration: "",
      description: "",
      isAvailableOnline: false,
      isActive: true,
      additionalServices: [],
      photos: defaultServicePhotos,
    },
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      const nextCategoryId = Number(values.categoryId);
      const formData = buildServiceFormData(values);

      if (
        Number.isFinite(nextCategoryId) &&
        nextCategoryId > 0 &&
        nextCategoryId !== categoryId
      ) {
        formData.append("service[service_category_id]", String(nextCategoryId));
      }

      appendPhotosToFormData(formData, values.photos);

      await updateService({
        categoryId,
        id: serviceId,
        data: formData,
      }).unwrap();
      router.back();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось обновить услугу"));
    }
  });

  const handleDelete = () => {
    Alert.alert("Удалить услугу?", "Это действие нельзя отменить", [
      { text: "Отмена" },

      {
        text: "Удалить",
        style: "destructive",

        onPress: async () => {
          try {
            await deleteService({
              categoryId: categoryId,
              id: serviceId,
            }).unwrap();

            router.back();
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Не удалось удалить услугу"));
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (!service) return;

    const legacyAdditionalUrls = service.additional_photos_urls ?? [];
    const additionalPhotoUrls = [
      service.additional_photo_first_url ?? legacyAdditionalUrls[0] ?? null,
      service.additional_photo_second_url ?? legacyAdditionalUrls[1] ?? null,
      service.additional_photo_third_url ?? legacyAdditionalUrls[2] ?? null,
      service.additional_photo_fourth_url ?? legacyAdditionalUrls[3] ?? null,
    ] as const;

    methods.reset({
      name: service.name ?? "",
      price: Math.trunc(centsToRubles(service.price_cents)).toString(),
      duration: service.duration?.toString() ?? "",
      categoryId: categoryId,
      description: service.description ?? "",
      isAvailableOnline: service.is_available_online ?? false,
      isActive: service.is_active ?? true,
      additionalServices: (service.additional_services ?? []).map(
        (additionalService) => ({
          serviceId: additionalService.id,
          name: additionalService.name,
          price: Math.trunc(centsToRubles(additionalService.price_cents)),
        }),
      ),
      photos: {
        mainPhoto: createEmptyPhotoSlot(service.main_photo_url ?? null),
        additionalPhotos: [
          createEmptyPhotoSlot(additionalPhotoUrls[0]),
          createEmptyPhotoSlot(additionalPhotoUrls[1]),
          createEmptyPhotoSlot(additionalPhotoUrls[2]),
          createEmptyPhotoSlot(additionalPhotoUrls[3]),
        ],
      },
    });
  }, [categoryId, methods, service]);

  if (!hasValidIds) {
    return (
      <ScreenWithToolbar title="Редактировать услугу">
        <View className="flex-1 items-center justify-center px-screen">
          <Typography className="text-center text-neutral-500">
            Не удалось определить услугу для редактирования
          </Typography>
        </View>
      </ScreenWithToolbar>
    );
  }

  if (isServiceLoading || (isServiceFetching && !service)) {
    return (
      <ScreenWithToolbar title="Редактировать услугу">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenWithToolbar>
    );
  }

  if (isServiceError || !service) {
    return (
      <ScreenWithToolbar title="Редактировать услугу">
        <View className="flex-1 items-center justify-center px-screen">
          <Typography className="text-center text-error">
            Не удалось загрузить данные услуги
          </Typography>
        </View>
      </ScreenWithToolbar>
    );
  }

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Редактировать услугу">
        {(insets) => (
          <ServiceFormBody
            insets={insets}
            loading={isLoading || isDeleting}
            onSubmit={onSubmit}
            onDelete={handleDelete}
            isEdit
          />
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default EditService;
