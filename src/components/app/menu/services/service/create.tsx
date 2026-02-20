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
import { useCreateServiceMutation } from "@/src/store/redux/services/api/servicesApi";

const schema = Yup.object({
  name: Yup.string().required("Введите название"),
  price: Yup.string().required("Введите цену"),
  duration: Yup.string().required("Введите длительность"),
  categoryId: Yup.number().required("Выберите категорию"),
});

type AppCreateServiceProps = {
  categoryId?: string;
};

const AppCreateService = ({ categoryId }: AppCreateServiceProps) => {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const [createService, { isLoading }] = useCreateServiceMutation();
  const parsedCategoryIdFromParams = Number(categoryId);

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
      online: false,
      additionalServices: defaultAdditionalServices,
    },
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    const parsedCategoryId = Number(values.categoryId);
    const parsedPrice = Number(values.price);
    const parsedDuration = Number(values.duration);

    if (
      Number.isNaN(parsedCategoryId) ||
      Number.isNaN(parsedPrice) ||
      Number.isNaN(parsedDuration)
    ) {
      return;
    }

    try {
      await createService({
        categoryId: parsedCategoryId,
        data: {
          name: values.name,
          price: parsedPrice,
          duration: parsedDuration,
        },
      }).unwrap();
      router.back();
    } catch (error) {
      console.log("CREATE SERVICE ERROR:", error);
    }
  });

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Создать услугу">
        {({ topInset }) => (
          <ServiceFormBody topInset={topInset} bottomInset={bottom} />
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default AppCreateService;
