import React, { useState } from "react";
import * as Yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
  ServiceImagesPicker,
  ServicePhotosValue,
} from "@/src/components/onboarding/service/ServiceImagesPicker";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/redux/store";
import {
  useCreateServiceCategoryMutation,
  useGetServiceCategoriesQuery,
} from "@/src/store/redux/services/api/servicesApi";

type ServiceFormValues = object;

const Service = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: categories } = useGetServiceCategoriesQuery(
    { userId: user?.id ?? 0 },
    {
      skip: !user,
    },
  );

  const [createCategory, { isLoading: creatingCategory }] =
    useCreateServiceCategoryMutation();

  console.log(categories, "categories");

  const [photos, setPhotos] = useState<ServicePhotosValue>({
    titlePhoto: { assets: [], max: 1 },
    otherPhoto: { assets: [], max: 4 },
  });

  const VerifySchema = Yup.object().shape({});

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: ServiceFormValues) => {
    console.log("SUBMIT", data);
    router.push(Routers.auth.schedule);
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
              onPress: methods.handleSubmit(onSubmit),
            }}
            secondary={{
              title: "Пропустить",
              variant: "clear",
              onPress: () => {
                router.push(Routers.auth.schedule);
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
              name="fruit"
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
