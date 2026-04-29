import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  OnboardingServiceSchema,
  type OnboardingServiceFormValues,
} from "@/src/validation/schemas/onboardingService.schema";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { View } from "react-native";
import { StepProgress } from "@/src/components/ui/StepProgress";
import { Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { RHFSelect } from "@/src/components/hookForm/rhf-select";
import { HOURS_OPTIONS } from "@/src/constants/hoursOptions";
import {
  createDefaultServicePhotos,
  ServiceImagesPicker,
  ServicePhotosValue,
} from "@/src/components/shared/imagePicker/serviceImagesPicker";
import { useGetFirstServiceCategoryQuery } from "@/src/store/redux/services/api/serviceCategoriesApi";
import { useCreateServiceMutation } from "@/src/store/redux/services/api/servicesApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { appendPhotosToFormData } from "@/src/utils/appendPhotosToFormData";
import { buildServiceFormData } from "@/src/utils/formData/buildServiceFormData";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";

const Service = () => {
  const auth = useRequiredAuth();
  const [photos, setPhotos] = useState<ServicePhotosValue>(
    createDefaultServicePhotos(),
  );

  const {
    data: defaultCategory,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    refetch: refetchCategory,
  } = useGetFirstServiceCategoryQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const [createService, { isLoading }] = useCreateServiceMutation();

  const methods = useForm<OnboardingServiceFormValues>({
    resolver: yupResolver(OnboardingServiceSchema),
    defaultValues: {
      name: "",
      price: "",
      duration: "",
    },
  });

  if (isCategoryError) {
    return (
      <ErrorScreen
        title="Не удалось загрузить данные"
        onRetry={refetchCategory}
        withTabBar={false}
      />
    );
  }

  const onSubmit = async (data: OnboardingServiceFormValues) => {
    if (!auth) return;

    try {
      const categoryId = defaultCategory?.id;
      if (!categoryId) {
        toast.error("Не удалось определить категорию услуг");
        return;
      }

      const formData = buildServiceFormData({
        name: data.name,
        price: data.price,
        duration: String(Number(data.duration) * 60),
        description: "",
        isAvailableOnline: false,
        isActive: true,
      });
      appendPhotosToFormData(formData, photos);

      await createService({
        categoryId,
        data: formData,
      }).unwrap();

      router.push(Routers.onboarding.schedule);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось сохранить услугу"));
    }
  };

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        avoidKeyboard
        footer={
          <AuthFooter
            primary={{
              title: "Сохранить",
              loading: isLoading,
              disabled: isLoading || isCategoryLoading,
              onPress: methods.handleSubmit(onSubmit),
            }}
            secondary={{
              title: "Пропустить",
              variant: "clear",
              disabled: isLoading,
              onPress: () => {
                router.push(Routers.onboarding.schedule);
              },
            }}
          />
        }
      >
        <View className="mt-4">
          <StepProgress steps={3} currentStep={2} />
        </View>
        <View className="mt-8 gap-2">
          <Typography weight="semibold" className="text-display mb-2">
            Первая услуга
          </Typography>
          <Typography className="text-body text-neutral-500">
            Добавь самую популярную
          </Typography>
          <View className="gap-2 mt-9">
            <RhfTextField name="name" label="Название" placeholder="Стрижка" />
          </View>
        </View>
        <View className="flex-row my-2 gap-3">
          <View className="flex-1">
            <RhfTextField
              name="price"
              label="Цена"
              placeholder="1 500 ₽"
              keyboardType="phone-pad"
            />
          </View>
          <View className="flex-1">
            <RHFSelect
              name="duration"
              label="Время"
              placeholder="1 час"
              items={HOURS_OPTIONS as any}
            />
          </View>
        </View>

        <ServiceImagesPicker value={photos} onChange={setPhotos} />
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Service;
