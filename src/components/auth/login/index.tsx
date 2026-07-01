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
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorCode, getApiErrorMessage } from "@/src/utils/apiError";
import { identifierMask } from "@/src/utils/mask/maskPhone";
import { useAuth } from "@/src/contexts/AuthContext";
import getRedirectPath from "@/src/utils/getOnboardingStep";
import { Routers } from "@/src/constants/routers";
import { AccountDeactivatedModal } from "@/src/components/auth/verify/AccountDeactivatedModal";

const Login = () => {
  const [loginMutation, { isLoading }] = useLoginMutation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [accountDeactivatedVisible, setAccountDeactivatedVisible] =
    useState(false);

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
          phone: isEmail ? undefined : data.identifier,
          password: data.password,
          type: UserType.USER,
        }).unwrap();

        await login(result.token);
        router.replace(getRedirectPath(result.resource));
      } catch (error) {
        const code = getApiErrorCode(error);
        if (code === "account_deactivated") {
          setAccountDeactivatedVisible(true);
        } else {
          toast.error(getApiErrorMessage(error, "Произошла ошибка"));
        }
      }
    },
    [login, loginMutation],
  );

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
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
        <View className="mt-14">
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
      <AccountDeactivatedModal
        visible={accountDeactivatedVisible}
        onClose={() => setAccountDeactivatedVisible(false)}
      />
    </FormProvider>
  );
};

export default Login;
