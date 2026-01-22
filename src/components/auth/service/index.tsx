import React from "react";
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
import { RHFTextField } from "@/src/components/hookForm/rhfTextField";

type ServiceFormValues = {};

const Service = () => {
  const VerifySchema = Yup.object().shape({});

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {},
  });

  const onSubmit = (data: ServiceFormValues) => {
    console.log("SUBMIT", data);
    router.push(Routers.auth.schedule);
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
          <StepProgress steps={3} currentStep={2} />
        </View>
        <View className="mt-8 gap-2">
          <Typography weight="semibold" className="text-display mb-2">
            Твоя визитка
          </Typography>
          <Typography weight="medium" className="text-body text-gray">
            Чтобы клиенты знали, к кому идут
          </Typography>

          <View className="gap-2 mt-9">
            <RHFTextField name="name" label="Имя" placeholder="Иван" />
          </View>
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Service;
