import React from "react";
import { View } from "react-native";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { Typography } from "@/src/components/ui";
import * as Yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RHFTextField } from "@/src/components/hookForm/rhfTextField";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";

type RegisterFormValues = {
  email: string;
};

const Register = () => {
  const VerifySchema = Yup.object().shape({
    password: Yup.string()
      .min(6, "Пароль должен содержать минимум 6 символов")
      .required("Введите пароль"),
    email: Yup.string()
      .email("Введите корректный email")
      .required("Введите email"),
  });

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      password: "",
      email: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    console.log("SUBMIT", data);
    router.push(Routers.auth.experience);
  };

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        footer={
          <AuthFooter
            title="Создать профиль"
            onSubmit={methods.handleSubmit(onSubmit)}
          />
        }
      >
        <View className="mt-14">
          <Typography weight="semibold" className="text-display mb-2">
            Безопасность
          </Typography>
          <Typography weight="medium" className="text-body text-gray">
            Защити базу клиентов паролем и привяжи почту для восстановления
          </Typography>
          <View className="gap-2 mt-9">
            <RHFTextField
              name="password"
              label="Пароль"
              placeholder="••••••••"
              secureTextEntry
            />
            <RHFTextField
              name="email"
              label="Электронная почта"
              placeholder="master@example.com"
            />
          </View>
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Register;
