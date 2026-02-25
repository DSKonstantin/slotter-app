import React, { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, View } from "react-native";
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
import { appendPhotosToFormData } from "@/src/utils/appendPhotosToFormData";
import map from "lodash/map";
import { toast } from "@backpackapp-io/react-native-toast";
import { serviceFormSchema } from "@/src/validation/schemas/serviceForm.schema";

type EditServiceProps = {
  serviceId: number;
  categoryId: number;
};

const EditService = ({ serviceId, categoryId }: EditServiceProps) => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const [updateService, { isLoading }] = useUpdateServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const {
    data: service,
    isLoading: isServiceLoading,
    isFetching: isServiceFetching,
    isError: isServiceError,
  } = useGetServiceQuery(
    {
      categoryId,
      id: serviceId,
    },
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
      const formData = new FormData();

      formData.append("service[name]", values.name.trim());
      formData.append("service[price]", values.price);
      formData.append("service[duration]", values.duration);
      formData.append("service[description]", values.description.trim());
      formData.append(
        "service[is_available_online]",
        String(values.isAvailableOnline),
      );
      formData.append("service[is_active]", String(values.isActive));
      appendPhotosToFormData(formData, values.photos);

      await updateService({
        categoryId: categoryId,
        id: serviceId,
        data: formData,
      }).unwrap();
      router.back();
    } catch (error: any) {
      toast.error(error?.data?.error || "Не удалось обновить услугу");
      console.log("UPDATE SERVICE ERROR:", error);
    }
  });

  const handleDelete = () => {
    Alert.alert("Удалить категорию?", "Это действие нельзя отменить", [
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
          } catch (error: any) {
            toast.error(error?.data?.error || "Не удалось удалить услугу");
            console.log("DELETE ERROR:", JSON.stringify(error, null, 2));
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (!service) return;
    methods.reset({
      name: service.name ?? "",
      price: Math.trunc(service.price_cents / 100).toString(),
      duration: service.duration?.toString() ?? "",
      categoryId: categoryId,
      description: service.description ?? "",
      isAvailableOnline: service.is_available_online ?? false,
      isActive: service.is_active ?? true,
      additionalServices: (service.additional_services ?? []).map(
        (additionalService) => ({
          id: String(additionalService.id),
          title: additionalService.name,
          duration: 0,
          price: Number(additionalService.price),
        }),
      ),
      photos: {
        titlePhoto: {
          assets: service.main_photo_url
            ? [
                {
                  id: `main-${service.id}`,
                  uri: service.main_photo_url,
                  name: "main.jpg",
                  mimeType: "image/jpeg",
                  lastModified: Date.now(),
                },
              ]
            : [],
          max: 1,
        },
        otherPhoto: {
          assets: map(
            service.additional_photo_urls,
            (uri: string, index: number) => ({
              id: `additional-${service.id}-${index}`,
              uri,
              name: `additional-${index}.jpg`,
              mimeType: "image/jpeg",
              lastModified: Date.now(),
            }),
          ),
          max: 4,
        },
      },
    });
  }, [categoryId, methods, service]);

  if (!serviceId && !categoryId) {
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
        {({ topInset }) => (
          <ServiceFormBody
            topInset={topInset}
            loading={isLoading || isDeleting}
            bottomInset={bottom}
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
