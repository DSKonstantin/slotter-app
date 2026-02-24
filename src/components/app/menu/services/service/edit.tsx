import * as Yup from "yup";
import React, { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import ServiceFormBody, {
  defaultServicePhotos,
  ServiceFormValues,
} from "@/src/components/app/menu/services/service/serviceForm";
import { Typography } from "@/src/components/ui";
import {
  useGetServiceQuery,
  useUpdateServiceMutation,
} from "@/src/store/redux/services/api/servicesApi";
import type {
  PhotoAsset,
  ServicePhotosValue,
} from "@/src/components/shared/imagePicker/serviceImagesPicker";

const schema = Yup.object({
  name: Yup.string().required("Введите название"),
  price: Yup.string().required("Введите цену"),
  duration: Yup.string().required("Введите длительность"),
  categoryId: Yup.number().required("Выберите категорию"),
});

const REMOTE_URI_PATTERN = /^https?:\/\//i;

const getFileNameFromUri = (uri: string, fallback: string): string => {
  const normalized = uri.split("?")[0];
  const candidate = normalized.split("/").pop();

  if (!candidate || !candidate.includes(".")) {
    return fallback;
  }

  return candidate;
};

const getMimeTypeFromName = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
    case "heif":
      return "image/heic";
    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
};

const getAssetFileName = (asset: PhotoAsset, fallback: string): string => {
  if ("fileName" in asset && asset.fileName) {
    return asset.fileName;
  }

  if ("name" in asset && asset.name) {
    return asset.name;
  }

  return getFileNameFromUri(asset.uri, fallback);
};

const toUploadableFile = (
  asset: PhotoAsset,
  fallbackName: string,
): { uri: string; name: string; type: string } | null => {
  if (!asset.uri || REMOTE_URI_PATTERN.test(asset.uri)) {
    return null;
  }

  const name = getAssetFileName(asset, fallbackName);
  const type = asset.mimeType || getMimeTypeFromName(name);

  return {
    uri: asset.uri,
    name,
    type,
  };
};

const toRemotePhotoAsset = (uri: string, fallbackName: string): PhotoAsset => {
  const name = getFileNameFromUri(uri, fallbackName);

  return {
    id: `remote-${name}-${uri}`,
    uri,
    name,
    mimeType: getMimeTypeFromName(name),
    lastModified: Date.now(),
  };
};

type EditServiceProps = {
  serviceId?: string;
  categoryId?: string;
};

const EditService = ({ serviceId, categoryId }: EditServiceProps) => {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const [updateService] = useUpdateServiceMutation();
  const [photos, setPhotos] =
    useState<ServicePhotosValue>(defaultServicePhotos);
  const hydratedServiceIdRef = useRef<number | null>(null);
  const parsedServiceId = Number(serviceId);
  const parsedCategoryIdFromParams = Number(categoryId);
  const hasValidParams =
    !Number.isNaN(parsedServiceId) && !Number.isNaN(parsedCategoryIdFromParams);

  const {
    data: service,
    isLoading: isServiceLoading,
    isFetching: isServiceFetching,
    isError: isServiceError,
  } = useGetServiceQuery(
    {
      categoryId: parsedCategoryIdFromParams,
      id: parsedServiceId,
    },
    {
      skip: !hasValidParams,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const methods = useForm<ServiceFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      price: "",
      duration: "",
      categoryId: Number.isNaN(parsedCategoryIdFromParams)
        ? null
        : parsedCategoryIdFromParams,
      description: "",
      isAvailableOnline: false,
      additionalServices: [],
    },
  });

  console.log(service, "service");

  const onSubmit = methods.handleSubmit(async (values) => {
    const parsedCategoryId = Number(values.categoryId);
    const parsedPrice = Number(values.price);
    const parsedDuration = Number(values.duration);

    if (
      Number.isNaN(parsedServiceId) ||
      Number.isNaN(parsedCategoryId) ||
      Number.isNaN(parsedPrice) ||
      Number.isNaN(parsedDuration)
    ) {
      return;
    }

    try {
      const formData = new FormData();

      formData.append("service[name]", values.name.trim());
      formData.append("service[price]", String(parsedPrice));
      formData.append("service[duration]", String(parsedDuration));
      formData.append("service[description]", values.description.trim());
      formData.append(
        "service[is_available_online]",
        String(values.isAvailableOnline),
      );

      const mainPhoto = photos.titlePhoto.assets[0];

      if (mainPhoto) {
        const uploadableMainPhoto = toUploadableFile(
          mainPhoto,
          `main-photo-${parsedServiceId}.jpg`,
        );

        if (uploadableMainPhoto) {
          formData.append(
            "service[main_photo]",
            uploadableMainPhoto as unknown as Blob,
          );
        }
      }

      photos.otherPhoto.assets.forEach((asset, index) => {
        const uploadableAdditionalPhoto = toUploadableFile(
          asset,
          `additional-photo-${index + 1}.jpg`,
        );

        if (uploadableAdditionalPhoto) {
          formData.append(
            "service[additional_photos][]",
            uploadableAdditionalPhoto as unknown as Blob,
          );
        }
      });

      await updateService({
        categoryId: parsedCategoryId,
        id: parsedServiceId,
        data: formData,
      }).unwrap();
      router.back();
    } catch (error) {
      console.log("UPDATE SERVICE ERROR:", error);
    }
  });

  useEffect(() => {
    hydratedServiceIdRef.current = null;
  }, [parsedServiceId]);

  useEffect(() => {
    if (!service) return;

    if (hydratedServiceIdRef.current === service.id) {
      return;
    }

    methods.reset({
      name: service.name ?? "",
      price: Math.trunc(service.price_cents / 100).toString(),
      duration: service.duration?.toString() ?? "",
      categoryId: Number.isNaN(parsedCategoryIdFromParams)
        ? null
        : parsedCategoryIdFromParams,
      description: service.description ?? "",
      isAvailableOnline: service.is_available_online ?? false,
      additionalServices: (service.additional_services ?? []).map(
        (additionalService) => ({
          id: String(additionalService.id),
          title: additionalService.name,
          duration: 0,
          price: Number(additionalService.price),
        }),
      ),
    });

    setPhotos({
      titlePhoto: {
        max: defaultServicePhotos.titlePhoto.max,
        assets: service.main_photo_url
          ? [
              toRemotePhotoAsset(
                service.main_photo_url,
                `main-photo-${service.id}.jpg`,
              ),
            ]
          : [],
      },
      otherPhoto: {
        max: defaultServicePhotos.otherPhoto.max,
        assets: (service.additional_photos_urls ?? [])
          .slice(0, defaultServicePhotos.otherPhoto.max)
          .map((uri, index) =>
            toRemotePhotoAsset(uri, `additional-photo-${index + 1}.jpg`),
          ),
      },
    });

    hydratedServiceIdRef.current = service.id;
  }, [methods, parsedCategoryIdFromParams, service]);

  if (!hasValidParams) {
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
            bottomInset={bottom}
            onSubmit={onSubmit}
            photos={photos}
            onPhotosChange={setPhotos}
          />
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default EditService;
