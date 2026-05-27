import React, { useCallback } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";
import { Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { useSendCodeMutation } from "@/src/store/redux/services/api/authApi";
import { UserType } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import { Routers } from "@/src/constants/routers";
import {
  resetPasswordPhoneSchema,
  type ResetPasswordPhoneValues,
} from "@/src/validation/schemas/resetPassword.schema";

const ResetPasswordPhone = () => {
  const [sendCode, { isLoading }] = useSendCodeMutation();

  const methods = useForm<ResetPasswordPhoneValues>({
    resolver: yupResolver(resetPasswordPhoneSchema),
    defaultValues: { phone: "" },
  });

  const onSubmit = useCallback(
    async ({ phone }: ResetPasswordPhoneValues) => {
      try {
        await sendCode({ phone, type: UserType.USER }).unwrap();
        router.push({
          pathname: Routers.auth.resetPassword.verify,
          params: { phone },
        });
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось отправить код"));
      }
    },
    [sendCode],
  );

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        avoidKeyboard
        footer={
          <AuthFooter
            primary={{
              title: "Отправить код",
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
            Сброс пароля
          </Typography>
          <Typography className="text-body text-neutral-500">
            Введите номер телефона, на него мы отправим код для сброса пароля
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
    </FormProvider>
  );
};

export default ResetPasswordPhone;
