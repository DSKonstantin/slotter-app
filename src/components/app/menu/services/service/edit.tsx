import * as Yup from "yup";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import ServiceFormBody, {
  defaultAdditionalServices,
  ServiceFormValues,
} from "@/src/components/app/menu/services/service/serviceForm";
import { IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useUpdateServiceMutation } from "@/src/store/redux/services/api/servicesApi";

const schema = Yup.object({
  name: Yup.string().required("Введите название"),
  price: Yup.string().required("Введите цену"),
  duration: Yup.string().required("Введите длительность"),
  categoryId: Yup.number().required("Выберите категорию"),
});

type EditServiceProps = {
  serviceId?: string;
  categoryId?: string;
};

const EditService = ({ serviceId, categoryId }: EditServiceProps) => {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const [updateService, { isLoading }] = useUpdateServiceMutation();
  const parsedCategoryIdFromParams = Number(categoryId);

  const methods = useForm<ServiceFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: serviceId ? `Услуга #${serviceId}` : "",
      price: "",
      duration: "",
      categoryId: Number.isNaN(parsedCategoryIdFromParams)
        ? null
        : parsedCategoryIdFromParams,
      description: "",
      online: false,
      additionalServices: defaultAdditionalServices,
    },
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    const parsedServiceId = Number(serviceId);
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
      await updateService({
        categoryId: parsedCategoryId,
        id: parsedServiceId,
        data: {
          name: values.name,
          price: parsedPrice,
          duration: parsedDuration,
        },
      }).unwrap();
      router.back();
    } catch (error) {
      console.log("UPDATE SERVICE ERROR:", error);
    }
  });

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Редактировать услугу">
        {({ topInset }) => (
          <ServiceFormBody topInset={topInset} bottomInset={bottom} />
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default EditService;
