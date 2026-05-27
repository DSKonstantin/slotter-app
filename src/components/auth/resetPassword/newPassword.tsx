import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { router, useLocalSearchParams } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";
import { StSvg, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { useResetPasswordMutation } from "@/src/store/redux/services/api/authApi";
import {
  type AuthResponse,
  UserType,
} from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { useAuth } from "@/src/contexts/AuthContext";
import EyeToggle from "@/src/components/shared/EyeToggle";
import { colors } from "@/src/styles/colors";
import getRedirectPath from "@/src/utils/getOnboardingStep";
import {
  resetPasswordNewSchema,
  type ResetPasswordNewValues,
} from "@/src/validation/schemas/resetPassword.schema";

const ResetPasswordNew = () => {
  const params = useLocalSearchParams<{ phone: string; code: string }>();
  const phone = Array.isArray(params.phone) ? params.phone[0] : params.phone;
  const code = Array.isArray(params.code) ? params.code[0] : params.code;

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authResult, setAuthResult] = useState<AuthResponse | null>(null);

  const methods = useForm<ResetPasswordNewValues>({
    resolver: yupResolver(resetPasswordNewSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const onSubmit = useCallback(
    async ({ password, password_confirmation }: ResetPasswordNewValues) => {
      try {
        const result = await resetPassword({
          phone,
          code,
          password,
          password_confirmation,
          type: UserType.USER,
        }).unwrap();

        setAuthResult(result);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось сбросить пароль"));
      }
    },
    [phone, code, resetPassword],
  );

  const handleGoToProfile = useCallback(async () => {
    if (!authResult) return;
    await login(authResult.token);
    router.replace(getRedirectPath(authResult.resource));
  }, [authResult, login]);

  if (authResult) {
    return (
      <AuthScreenLayout
        header={<AuthHeader showBack={false} />}
        footer={
          <AuthFooter
            primary={{
              title: "Перейти к профилю",
              variant: "accent",
              onPress: handleGoToProfile,
            }}
          />
        }
      >
        <View className="flex-1 items-center justify-center gap-4 mb-[55px]">
          <StSvg
            name="check_ring_round_light"
            size={80}
            color={colors.primary.blue[500]}
          />
          <View className="items-center gap-1">
            <Typography weight="semibold" className="text-display">
              Готово!
            </Typography>
            <Typography
              weight="semibold"
              className="text-body text-neutral-500"
            >
              Ваш пароль успешно изменён
            </Typography>
          </View>
        </View>
      </AuthScreenLayout>
    );
  }

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        avoidKeyboard
        footer={
          <AuthFooter
            primary={{
              title: "Сохранить пароль",
              variant: "accent",
              loading: isLoading,
              disabled: isLoading,
              onPress: methods.handleSubmit(onSubmit),
            }}
          />
        }
      >
        <View className="mt-14">
          <Typography weight="semibold" className="text-display mb-2">
            Новый пароль
          </Typography>
          <Typography className="text-body text-neutral-500">
            Придумайте новый пароль для вашего аккаунта
          </Typography>

          <View className="gap-1 mt-9">
            <RhfTextField
              name="password"
              label="Новый пароль"
              placeholder="Минимум 8 символов"
              secureTextEntry={!showPassword}
              endAdornment={
                <EyeToggle
                  visible={showPassword}
                  onPress={() => setShowPassword((v) => !v)}
                />
              }
            />
            <RhfTextField
              name="password_confirmation"
              label="Подтвердите пароль"
              placeholder="••••••••"
              secureTextEntry={!showConfirm}
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

export default ResetPasswordNew;
