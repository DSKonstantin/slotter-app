import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import ServiceFormBody, {
  defaultAdditionalServices,
  defaultServicePhotos,
} from "@/src/components/app/menu/services/service/serviceForm";
import { useCreateServiceMutation } from "@/src/store/redux/services/api/servicesApi";
import { appendPhotosToFormData } from "@/src/utils/appendPhotosToFormData";
import { toast } from "@backpackapp-io/react-native-toast";
import { serviceFormSchema } from "@/src/validation/schemas/serviceForm.schema";

type AppCreateServiceProps = {
  categoryId?: string;
};

const AppCreateService = ({ categoryId }: AppCreateServiceProps) => {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const [createService, { isLoading }] = useCreateServiceMutation();
  const parsedCategoryIdFromParams = Number(categoryId);

  const methods = useForm({
    resolver: yupResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      price: "",
      duration: "",
      categoryId: parsedCategoryIdFromParams,
      description: "",
      isAvailableOnline: false,
      isActive: true,
      additionalServices: defaultAdditionalServices,
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

      await createService({
        categoryId: Number(values.categoryId),
        data: formData,
      }).unwrap();

      router.back();
    } catch (error: any) {
      toast.error(error?.data?.error || "Не удалось создать услугу");
      console.log("CREATE SERVICE ERROR:", error);
    }
  });

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Создать услугу">
        {({ topInset }) => (
          <ServiceFormBody
            topInset={topInset}
            bottomInset={bottom}
            loading={isLoading}
            onSubmit={onSubmit}
          />
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default AppCreateService;
