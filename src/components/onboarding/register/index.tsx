import React, { useCallback } from "react";
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
import { useUpdateUserMutation } from "@/src/store/redux/services/api/authApi";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/redux/store";
import { toast } from "@backpackapp-io/react-native-toast";

type RegisterFormValues = {
  email: string;
  password: string;
};

const RegisterSchema = Yup.object().shape({
  password: passwordField,
  email: Yup.string()
    .email("Введите корректный email")
    .required("Введите email"),
});

const Register = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues: {
      password: "",
      email: user?.email ?? "",
    },
  });

  const onSubmit = useCallback(
    async (data: RegisterFormValues) => {
      if (!user) return;

      try {
        await updateUser({
          id: user.id,
          data: {
            email: data.email,
            password: data.password,
          },
        }).unwrap();

        router.push(Routers.app.root);
      } catch (error: any) {
        console.log("UPDATE USER ERROR:", error);
        toast.error(error?.data?.error || "Произошла ошибка при обновлении.");
      }
    },
    [user, updateUser],
  );

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        avoidKeyboard
        footer={
          <AuthFooter
            primary={{
              title: "Создать профиль",
              disabled: isLoading,
              loading: isLoading,
              onPress: methods.handleSubmit(onSubmit),
            }}
          />
        }
      >
        <View className="mt-14">
          <Typography weight="semibold" className="text-display mb-2">
            Безопасность
          </Typography>
          <Typography className="text-body text-neutral-500">
            Защити базу клиентов паролем и привяжи почту для восстановления
          </Typography>
          <View className="gap-2 mt-9">
            <RhfTextField
              name="email"
              label="Электронная почта"
              placeholder="master@example.com"
            />
            <RhfTextField
              name="password"
              label="Пароль"
              placeholder="••••••••"
              secureTextEntry
            />
          </View>
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Register;
