import React from "react";
import { View } from "react-native";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { Typography } from "@/src/components/ui";
import * as Yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { passwordField } from "@/src/validation/fields/password";

type RegisterFormValues = {
  email: string;
};

const VerifySchema = Yup.object().shape({
  password: passwordField,
  email: Yup.string()
    .email("Введите корректный email")
    .required("Введите email"),
});

const Register = () => {
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
        avoidKeyboard
        footer={
          <AuthFooter
            primary={{
              title: "Создать профиль",
              onPress: methods.handleSubmit(onSubmit),
            }}
          />
        }
      >
        <View className="mt-14">
          <Typography weight="semibold" className="text-display mb-2">
            Безопасность
          </Typography>
          <Typography weight="medium" className="text-body text-neutral-500">
            Защити базу клиентов паролем и привяжи почту для восстановления
          </Typography>
          <View className="gap-2 mt-9">
            <RhfTextField
              name="password"
              label="Пароль"
              placeholder="••••••••"
              secureTextEntry
            />
            <RhfTextField
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
