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
import { useCreateServiceForUserMutation } from "@/src/store/redux/services/api/servicesApi";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import { appendPhotosToFormData } from "@/src/utils/appendPhotosToFormData";
import { buildServiceFormData } from "@/src/utils/formData/buildServiceFormData";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { STEP_PROGRESS, TOTAL_STEPS } from "@/src/utils/getOnboardingStep";

const Service = () => {
  const auth = useRequiredAuth();
  const [photos, setPhotos] = useState<ServicePhotosValue>(
    createDefaultServicePhotos(),
  );

  const [createServiceForUser, { isLoading }] =
    useCreateServiceForUserMutation();
  const [updateUser, { isLoading: isUpdatingStep }] = useUpdateUserMutation();
  const [skipUser, { isLoading: isSkipping }] = useUpdateUserMutation();

  const methods = useForm<OnboardingServiceFormValues>({
    resolver: yupResolver(OnboardingServiceSchema),
    defaultValues: {
      name: "",
      price: "",
      duration: "",
    },
  });

  const handleSkip = async () => {
    if (!auth) return;
    try {
      await skipUser({
        id: auth.userId,
        data: { onboarding_step: "schedule" },
      }).unwrap();
      router.push(Routers.onboarding.schedule);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось пропустить шаг"));
    }
  };

  const onSubmit = async (data: OnboardingServiceFormValues) => {
    if (!auth) return;

    try {
      const formData = buildServiceFormData({
        name: data.name,
        price: data.price,
        duration: data.duration,
        description: "",
        isAvailableOnline: false,
        isActive: true,
      });
      appendPhotosToFormData(formData, photos);

      await createServiceForUser({
        userId: auth.userId,
        data: formData,
      }).unwrap();

      await updateUser({
        id: auth.userId,
        data: { onboarding_step: "schedule" },
      }).unwrap();

      router.push(Routers.onboarding.schedule);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось сохранить услугу"));
    }
  };

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader showLogout />}
        avoidKeyboard
        collapsibleHeader={
          <View className="mt-2">
            <StepProgress
              steps={TOTAL_STEPS}
              currentStep={STEP_PROGRESS.service!}
            />

            <Typography weight="semibold" className="text-display mt-8">
              Первая услуга
            </Typography>
          </View>
        }
        footer={
          <AuthFooter
            primary={{
              title: "Сохранить",
              loading: isLoading || isUpdatingStep,
              disabled: isLoading || isUpdatingStep,
              onPress: methods.handleSubmit(onSubmit),
            }}
            secondary={{
              title: "Пропустить",
              variant: "clear",
              disabled: isLoading || isSkipping,
              loading: isSkipping,
              onPress: handleSkip,
            }}
          />
        }
      >
        <View className="gap-2">
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
              items={HOURS_OPTIONS}
            />
          </View>
        </View>

        <ServiceImagesPicker value={photos} onChange={setPhotos} />
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Service;
