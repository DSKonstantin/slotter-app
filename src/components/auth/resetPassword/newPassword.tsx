import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocalSearchParams } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";
import { Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { useResetPasswordMutation } from "@/src/store/redux/services/api/authApi";
import { UserType } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { useHandleAuthorized } from "@/src/components/auth/useHandleAuthorized";
import EyeToggle from "@/src/components/shared/EyeToggle";
import {
  resetPasswordNewSchema,
  type ResetPasswordNewValues,
} from "@/src/validation/schemas/resetPassword.schema";

const ResetPasswordNew = () => {
  // 1. useState
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 3. Custom hooks + RTK Query
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const handleAuthorized = useHandleAuthorized();

  const methods = useForm<ResetPasswordNewValues>({
    resolver: yupResolver(resetPasswordNewSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  // 5. useCallback
  const onSubmit = useCallback(
    async ({ password, password_confirmation }: ResetPasswordNewValues) => {
      try {
        const result = await resetPassword({
          type: UserType.USER,
          phone,
          password,
          password_confirmation,
        }).unwrap();

        if (result.status === "authorized") {
          await handleAuthorized(result.token, result.resource);
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось сбросить пароль"));
      }
    },
    [resetPassword, phone, handleAuthorized],
  );

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
