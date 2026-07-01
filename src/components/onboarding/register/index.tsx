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
import getRedirectPath from "@/src/utils/getOnboardingStep";
import {
  RegisterSchema,
  type RegisterFormValues,
} from "@/src/validation/schemas/register.schema";
import { useUpdateCredentialsMutation } from "@/src/store/redux/services/api/authApi";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { toast } from "@backpackapp-io/react-native-toast";


const Register = () => {
  const auth = useRequiredAuth();

  const [updateCredentials, { isLoading }] = useUpdateCredentialsMutation();
  const [updateUser] = useUpdateUserMutation();

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = useCallback(
    async (data: RegisterFormValues) => {
      if (!auth) return;

      try {
        const { user } = await updateCredentials({
          id: auth.userId,
          data: {
            password: data.password,
            password_confirmation: data.passwordConfirmation,
            onboarding_step: "personal_information",
          },
        }).unwrap();

        router.push(getRedirectPath(user!));
      } catch {
        try {
          const { user } = await updateUser({
            id: auth.userId,
            data: { onboarding_step: "personal_information" },
          }).unwrap();
          router.push(getRedirectPath(user));
        } catch {
          toast.error("Не удалось установить пароль. Попробуйте ещё раз.");
        }
      }
    },
    [auth, updateCredentials, updateUser],
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
              title: "Создать пароль",
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
            Защити базу клиентов паролем
          </Typography>
          <View className="gap-2 mt-9">
            <RhfTextField
              name="password"
              label="Пароль"
              placeholder="••••••••"
              secureTextEntry
            />
            <RhfTextField
              name="passwordConfirmation"
              label="Повторите пароль"
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
