import React, { useCallback } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { useAccountDeactivatedModal } from "@/src/components/auth/useAccountDeactivatedModal";
import { AuthMethodsFlowSheet } from "@/src/components/auth/AuthMethodsFlowSheet";
import { useAuthMethodsFlow } from "@/src/components/auth/useAuthMethodsFlow";
import { setToken } from "@/src/store/redux/slices/authSlice";
import { useAppDispatch } from "@/src/store/redux/store";
import { maskPhone, normalizePhone } from "@/src/utils/mask/maskPhone";
import { Routers } from "@/src/constants/routers";
import {
  resetPasswordPhoneSchema,
  type ResetPasswordPhoneValues,
} from "@/src/validation/schemas/resetPassword.schema";

const ResetPasswordPhone = () => {
  const dispatch = useAppDispatch();

  const methods = useForm<ResetPasswordPhoneValues>({
    resolver: yupResolver(resetPasswordPhoneSchema),
    defaultValues: { phone: "" },
  });

  const rawPhone = methods.watch("phone");
  const sessionPhone = normalizePhone(rawPhone);

  const { show: showAccountDeactivated, modal: accountDeactivatedModal } =
    useAccountDeactivatedModal();

  const handleCallbackAuthorized = useCallback(
    (token: string) => {
      dispatch(setToken(token));
      router.push({
        pathname: Routers.resetPassword.newPassword,
        params: { phone: sessionPhone },
      });
    },
    [dispatch, sessionPhone],
  );

  const authMethods = useAuthMethodsFlow({
    flow: "reset",
    phone: sessionPhone,
    onCallbackAuthorized: handleCallbackAuthorized,
    onAccountDeactivated: showAccountDeactivated,
  });

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        avoidKeyboard
        stickyFooter
        footer={
          <AuthFooter
            primary={{
              title: "Продолжить",
              variant: "accent",
              loading: authMethods.isPending,
              disabled: authMethods.isPending,
              onPress: methods.handleSubmit(authMethods.openSheet),
            }}
          />
        }
      >
        <View className="mt-8">
          <Typography weight="semibold" className="text-display mb-2">
            Сброс пароля
          </Typography>
          <Typography className="text-body text-neutral-500">
            Введите номер телефона, подтвердите его и задайте новый пароль
          </Typography>

          <View className="mt-9">
            <RhfTextField
              name="phone"
              label="Телефон"
              placeholder="+ 7 999 000-00-00"
              keyboardType="phone-pad"
              maskFn={maskPhone}
            />
          </View>
        </View>
      </AuthScreenLayout>

      <AuthMethodsFlowSheet flow={authMethods} />

      {accountDeactivatedModal}
    </FormProvider>
  );
};

export default ResetPasswordPhone;
