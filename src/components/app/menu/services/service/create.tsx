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
      const additionalServiceIds =
        values.additionalServices?.map((s) => s.serviceId) ?? [];

      const formData = new FormData();
      formData.append("service[name]", values.name.trim());
      formData.append("service[price]", String(Number(values.price)));
      formData.append("service[duration]", String(Number(values.duration)));
      formData.append("service[description]", values.description.trim());
      formData.append(
        "service[is_available_online]",
        String(values.isAvailableOnline),
      );
      formData.append("service[is_active]", String(values.isActive));

      if (!additionalServiceIds.length) {
        formData.append("service[additional_service_ids][]", "");
      } else {
        additionalServiceIds.forEach((id) => {
          formData.append("service[additional_service_ids][]", String(id));
        });
      }

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
