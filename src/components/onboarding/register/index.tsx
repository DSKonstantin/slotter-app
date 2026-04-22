import React, { useCallback } from "react";
import { View } from "react-native";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { Typography } from "@/src/components/ui";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import {
  RegisterSchema,
  type RegisterFormValues,
} from "@/src/validation/schemas/register.schema";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/authApi";
import { useAppSelector } from "@/src/store/redux/store";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";

const Register = () => {
  const auth = useRequiredAuth();
  const user = useAppSelector((s) => s.auth.user);

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
      if (!auth) return;

      try {
        await updateUser({
          id: auth.userId,
          data: {
            email: data.email,
            password: data.password,
            onboarding_step: "personalInformation",
          },
        }).unwrap();

        router.push(Routers.onboarding.experience);
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Произошла ошибка при обновлении."),
        );
      }
    },
    [auth, updateUser],
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
