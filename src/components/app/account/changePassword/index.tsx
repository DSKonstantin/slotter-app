import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { StSvg } from "@/src/components/ui";
import { FormSaveFooter } from "@/src/components/hookForm/FormSaveFooter";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { useUpdateCredentialsMutation } from "@/src/store/redux/services/api/authApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/src/validation/schemas/changePassword.schema";
import { colors } from "@/src/styles/colors";
import { BOTTOM_OFFSET } from "@/src/constants/tabs";
import EyeToggle from "@/src/components/shared/EyeToggle";

const ChangePassword = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const auth = useRequiredAuth();
  const [updateCredentials, { isLoading }] = useUpdateCredentialsMutation();

  const methods = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  useFormNavigationGuard(methods.formState.isDirty);

  const onSubmit = useCallback(
    async (values: ChangePasswordFormValues) => {
      if (!auth) return;
      try {
        await updateCredentials({
          id: auth.userId,
          data: {
            current_password: values.current_password,
            password: values.password,
            password_confirmation: values.password_confirmation,
          },
        }).unwrap();
        toast.success("Пароль изменён", {
          icon: (
            <StSvg
              name="check_ring_round_light"
              size={20}
              color={colors.neutral[900]}
            />
          ),
        });
        methods.reset();
        router.back();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось изменить пароль"));
      }
    },
    [auth, updateCredentials, methods],
  );

  if (!auth) return null;

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Смена пароля">
        {({ topInset, bottomInset }) => (
          <>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              bottomOffset={BOTTOM_OFFSET}
              contentContainerStyle={{
                paddingTop: topInset,
                paddingBottom: 16,
              }}
            >
              <View className="px-screen gap-1">
                <RhfTextField
                  name="current_password"
                  label="Текущий пароль"
                  placeholder="••••••••"
                  secureTextEntry={!showCurrent}
                  textContentType="password"
                  autoComplete="current-password"
                  endAdornment={
                    <EyeToggle
                      visible={showCurrent}
                      onPress={() => setShowCurrent((v) => !v)}
                    />
                  }
                />
                <RhfTextField
                  name="password"
                  label="Новый пароль"
                  placeholder="Минимум 8 символов"
                  hint="Минимум 8 символов, строчные и заглавные буквы, цифры"
                  secureTextEntry={!showNew}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  endAdornment={
                    <EyeToggle
                      visible={showNew}
                      onPress={() => setShowNew((v) => !v)}
                    />
                  }
                />
                <RhfTextField
                  name="password_confirmation"
                  label="Подтвердите пароль"
                  placeholder="••••••••"
                  secureTextEntry={!showConfirm}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  endAdornment={
                    <EyeToggle
                      visible={showConfirm}
                      onPress={() => setShowConfirm((v) => !v)}
                    />
                  }
                />
              </View>
            </KeyboardAwareScrollView>

            <FormSaveFooter
              title="Сохранить"
              bottomInset={bottomInset}
              loading={isLoading}
              onPress={methods.handleSubmit(onSubmit)}
            />
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default ChangePassword;
