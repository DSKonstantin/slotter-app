import React, { useCallback } from "react";
import { View } from "react-native";
import { Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { FormProvider, useForm } from "react-hook-form";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { passwordField } from "@/src/validation/fields/password";
import { useLoginMutation } from "@/src/store/redux/services/api/authApi";
import { UserType } from "@/src/store/redux/services/api-types";
import { accessTokenStorage } from "@/src/utils/tokenStorage/accessTokenStorage";
import { Routers } from "@/src/constants/routers";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";

type LoginFormValues = {
  identifier: string;
  password: string;
};

const VerifySchema = Yup.object().shape({
  identifier: Yup.string().required("Введите номер телефона или email"),
  password: passwordField,
});

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFormValues) => {
      try {
        const isEmail = data.identifier.includes("@");

        const result = await login({
          email: isEmail ? data.identifier : null,
          phone: isEmail ? "" : data.identifier,
          password: data.password,
          type: UserType.USER,
        }).unwrap();

        await accessTokenStorage.set(result.token);

        router.replace(Routers.app.root);
      } catch (error: any) {
        toast.error(error?.data?.error);
      }
    },
    [login],
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

export default Login;
