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
import {
  useUpdateCredentialsMutation,
  useLoginMutation,
} from "@/src/store/redux/services/api/authApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAuth } from "@/src/contexts/AuthContext";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";

const Register = () => {
  const auth = useRequiredAuth();
  const { login } = useAuth();

  const [updateCredentials] = useUpdateCredentialsMutation();
  const [loginMutation, { isLoading }] = useLoginMutation();

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues: {
      password: "",
      email: "",
    },
  });

  const onSubmit = useCallback(
    async (data: RegisterFormValues) => {
      if (!auth) return;

      try {
        await updateCredentials({
          resourceType: "customer",
          id: auth.userId,
          data: {
            email: data.email,
            password: data.password,
            password_confirmation: data.password,
          },
        }).unwrap();

        const result = await loginMutation({
          email: data.email,
          password: data.password,
          type: "customer",
        }).unwrap();

        await login(result.token);
        router.push(Routers.onboarding.personalName);
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            "Не удалось создать профиль. Попробуйте ещё раз.",
          ),
        );
      }
    },
    [auth, updateCredentials, loginMutation, login],
  );

  if (!auth) return null;

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
            Защити свои данные и привяжи почту для восстановления
          </Typography>
          <View className="gap-2 mt-9">
            <RhfTextField
              name="email"
              label="Электронная почта"
              placeholder="user@example.com"
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
