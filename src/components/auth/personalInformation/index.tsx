import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { View } from "react-native";
import { Avatar, Divider, Typography } from "@/src/components/ui";
import { RHFTextField } from "@/src/components/hookForm/rhfTextField";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { StepProgress } from "@/src/components/ui/StepProgress";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type PersonalInformationFormValues = {};

const PersonalInformation = () => {
  const VerifySchema = Yup.object().shape({});

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {},
  });

  const onSubmit = (data: PersonalInformationFormValues) => {
    console.log("SUBMIT", data);
    router.push(Routers.auth.service);
  };

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        footer={
          <AuthFooter title="Далее" onSubmit={methods.handleSubmit(onSubmit)} />
        }
      >
        <View className="mt-4">
          <StepProgress steps={3} currentStep={1} />
        </View>
        <View className="mt-8 gap-2">
          <Typography weight="semibold" className="text-display mb-2">
            Твоя визитка
          </Typography>
          <Typography weight="medium" className="text-body text-gray">
            Чтобы клиенты знали, к кому идут
          </Typography>

          <View className="flex-1 items-center my-4">
            <Avatar
              size="xl"
              fallbackIcon={
                <MaterialCommunityIcons
                  name="camera-party-mode"
                  size={40}
                  color="#8E8E93"
                />
              }
            />
          </View>

          <View className="gap-2">
            <RHFTextField name="name" label="Имя" placeholder="Иван" />

            <RHFTextField name="surname" label="Фамилия" placeholder="Иванов" />

            <RHFTextField
              name="profession"
              label="Профессия"
              placeholder="Барбер"
            />
          </View>
        </View>

        <Divider />

        <View className="mt-5">
          <Typography weight="medium" className="text-gray text-caption">
            Формат работы
          </Typography>
        </View>

        <RHFTextField
          name="address"
          label="Адрес"
          placeholder="Москва, ул. Пушкина, 5"
        />
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default PersonalInformation;
