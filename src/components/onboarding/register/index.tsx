import React, { useCallback, useState } from "react";
import { Alert, View } from "react-native";
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
import { toast } from "@/src/components/ui/toast";
import { getApiErrorCode, getApiErrorMessage } from "@/src/utils/apiError";
import EyeToggle from "@/src/components/shared/EyeToggle";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

        router.replace(getRedirectPath(user!));
      } catch (error) {
        if (getApiErrorCode(error) !== "invalid_current_password") {
          toast.error(
            getApiErrorMessage(
              error,
              "Не удалось установить пароль. Попробуйте ещё раз.",
            ),
          );
          return;
        }

        try {
          const { user } = await updateUser({
            id: auth.userId,
            data: { onboarding_step: "personal_information" },
          }).unwrap();

          Alert.alert(
            "Пароль уже задан",
            "Используйте его для входа на других устройствах. Не помните — «Забыли пароль?» на экране входа.",
            [
              {
                text: "Понятно",
                onPress: () => router.replace(getRedirectPath(user)),
              },
            ],
          );
        } catch (stepError) {
          toast.error(
            getApiErrorMessage(
              stepError,
              "Не удалось продолжить. Попробуйте ещё раз.",
            ),
          );
        }
      }
    },
    [auth, updateCredentials, updateUser],
  );

  if (!auth) return null;

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader showLogout />}
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
              hint="Минимум 8 символов, строчные и заглавные буквы, цифры"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              endAdornment={
                <EyeToggle
                  visible={showPassword}
                  onPress={() => setShowPassword((v) => !v)}
                />
              }
            />
            <RhfTextField
              name="passwordConfirmation"
              label="Повторите пароль"
              placeholder="••••••••"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              endAdornment={
                <EyeToggle
                  visible={showConfirm}
                  onPress={() => setShowConfirm((v) => !v)}
                />
              }
            />
          </View>
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Register;
