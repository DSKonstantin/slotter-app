import React from "react";
import AdditionalServicesForm from "@/src/components/app/menu/services/additionalServices/additionalServicesForm";
import { FormProvider, useForm } from "react-hook-form";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { yupResolver } from "@hookform/resolvers/yup";
import { IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useRouter } from "expo-router";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { additionalServiceFormSchema } from "@/src/validation/schemas/additionalServiceForm.schema";
import { useCreateAdditionalServiceMutation } from "@/src/store/redux/services/api/servicesApi";
import { toast } from "@backpackapp-io/react-native-toast";

const AdditionalServiceCreate = () => {
  const router = useRouter();
  const auth = useRequiredAuth();

  const [createAdditionalService, { isLoading }] =
    useCreateAdditionalServiceMutation();

  const methods = useForm({
    resolver: yupResolver(additionalServiceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      duration: "",
      isActive: true,
    },
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    if (!auth?.userId) return;

    try {
      await createAdditionalService({
        userId: auth.userId,
        data: {
          name: values.name.trim(),
          duration: Number(values.duration),
          price: Number(values.price),
          is_active: values.isActive,
        },
      }).unwrap();

      methods.reset();
      router.back();
    } catch (error: any) {
      toast.error(error?.data?.error || "Не удалось создать доп. услугу");
    }
  });

  if (!auth) return null;

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Создать доп. услугу">
        {(insets) => (
          <AdditionalServicesForm
            insets={insets}
            loading={isLoading}
            onSubmit={onSubmit}
          />
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default AdditionalServiceCreate;
