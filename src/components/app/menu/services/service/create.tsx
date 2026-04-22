import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import ServiceFormBody, {
  defaultServicePhotos,
} from "@/src/components/app/menu/services/service/serviceForm";
import { useCreateServiceMutation } from "@/src/store/redux/services/api/servicesApi";
import { appendPhotosToFormData } from "@/src/utils/appendPhotosToFormData";
import { buildServiceFormData } from "@/src/utils/formData/buildServiceFormData";
import { toast } from "@backpackapp-io/react-native-toast";
import { serviceFormSchema } from "@/src/validation/schemas/serviceForm.schema";
import { getApiErrorMessage } from "@/src/utils/apiError";

type AppCreateServiceProps = {
  categoryId?: string;
};

const AppCreateService = ({ categoryId }: AppCreateServiceProps) => {
  const router = useRouter();
  const [createService, { isLoading }] = useCreateServiceMutation();

  const methods = useForm({
    resolver: yupResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      price: "",
      duration: "",
      categoryId: Number(categoryId),
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
      appendPhotosToFormData(formData, values.photos);

      await createService({
        categoryId: nextCategoryId,
        data: formData,
      }).unwrap();
      router.back();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось создать услугу"));
    }
  });

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Создать услугу">
        {(insets) => (
          <ServiceFormBody
            insets={insets}
            loading={isLoading}
            onSubmit={onSubmit}
          />
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default AppCreateService;
