import React, { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { Typography } from "@/src/components/ui";
import EyeToggle from "@/src/components/shared/EyeToggle";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { FormProvider, useForm } from "react-hook-form";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/src/validation/schemas/login.schema";
import { useLoginMutation } from "@/src/store/redux/services/api/authApi";
import { UserType } from "@/src/store/redux/services/api-types";
import { router } from "expo-router";
import { toast } from "@/src/components/ui/toast";
import { getApiErrorCode, getApiErrorMessage } from "@/src/utils/apiError";
import { identifierMask, normalizePhone } from "@/src/utils/mask/maskPhone";
import { useHandleAuthorized } from "@/src/components/auth/useHandleAuthorized";
import { Routers } from "@/src/constants/routers";
import { useAccountDeactivatedModal } from "@/src/components/auth/useAccountDeactivatedModal";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [loginMutation, { isLoading }] = useLoginMutation();
  const handleAuthorized = useHandleAuthorized();
  const { show: showAccountDeactivated, modal: accountDeactivatedModal } =
    useAccountDeactivatedModal();

  const methods = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data: { identifier: string; password: string }) => {
      try {
        const isEmail = data.identifier.includes("@");

        const result = await loginMutation({
          email: isEmail ? data.identifier : undefined,
          phone: isEmail ? undefined : normalizePhone(data.identifier),
          password: data.password,
          type: UserType.USER,
        }).unwrap();

        await handleAuthorized(result.token, result.resource);
      } catch (error) {
        const code = getApiErrorCode(error);
        if (code === "account_deactivated") {
          showAccountDeactivated();
        } else {
          toast.error(getApiErrorMessage(error, "Произошла ошибка"));
        }
      }
    },
    [loginMutation, handleAuthorized, showAccountDeactivated],
  );

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        avoidKeyboard
        stickyFooter
        footer={
          <AuthFooter
            primary={{
              title: "Войти",
              variant: "accent",
              disabled: isLoading,
              loading: isLoading,
              onPress: methods.handleSubmit(onSubmit),
            }}
          />
        }
      >
        <View className="mt-8">
          <Typography weight="semibold" className="text-display mb-2">
            С возвращением!
          </Typography>
          <Typography className="text-body text-neutral-500">
            Введи номер, мы найдем профиль
          </Typography>

          <View className="gap-2 mt-9">
            <RhfTextField
              name="identifier"
              label="Телефон или электронная почта"
              placeholder="+ 7 999 000-00-00"
              maskFn={identifierMask}
            />
            <RhfTextField
              name="password"
              label="Пароль"
              labelRight={
                <Pressable
                  className="active:opacity-70"
                  onPress={() => router.push(Routers.resetPassword.root)}
                >
                  <Typography className="text-caption text-neutral-500 underline">
                    Забыли пароль?
                  </Typography>
                </Pressable>
              }
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              autoComplete="current-password"
              endAdornment={
                <EyeToggle
                  visible={showPassword}
                  onPress={() => setShowPassword((v) => !v)}
                />
              }
            />
          </View>
        </View>
      </AuthScreenLayout>
      {accountDeactivatedModal}
    </FormProvider>
  );
};

export default Login;
