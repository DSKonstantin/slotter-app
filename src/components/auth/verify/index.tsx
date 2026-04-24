import React, { useCallback } from "react";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import { View } from "react-native";
import AuthFooter from "@/src/components/auth/layout/footer";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import {
  VerifySchema,
  type VerifyFormValues,
} from "@/src/validation/schemas/verify.schema";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import { unMask } from "react-native-mask-text";
import { UserType } from "@/src/store/redux/services/api-types";
import { useSendCodeMutation } from "@/src/store/redux/services/api/authApi";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";

const Verify = () => {
  const [sendCode, { isLoading }] = useSendCodeMutation();

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = useCallback(
    async (data: VerifyFormValues) => {
      const phone = `+${unMask(data.phone)}`;

      try {
        await sendCode({ phone, type: UserType.USER }).unwrap();

        router.push({
          pathname: Routers.auth.enterCode,
          params: { phone },
        });
      } catch (e) {
        toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
      }
    },
    [sendCode],
  );

  const handleRestoreLogin = useCallback(() => {
    router.push(Routers.auth.restoreLogin);
  }, []);

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        avoidKeyboard
        header={<AuthHeader />}
        footer={
          <AuthFooter
            primary={{
              title: "Получить код",
              disabled: isLoading,
              loading: isLoading,
              onPress: methods.handleSubmit(onSubmit),
            }}
          />
        }
      >
        <View className="mt-14">
          <Typography weight="semibold" className="text-display mb-2">
            Твой номер
          </Typography>
          <Typography className="text-body text-neutral-500">
            Мы отправим код подтверждения
          </Typography>

          <View className="mt-9">
            <RhfTextField
              name="phone"
              placeholder="+ 7 999 000-00-00"
              maskFn={maskPhone}
              maxLength={16}
              hideErrorText
              keyboardType="number-pad"
            />
            <Typography className="text-caption text-neutral-500 my-2">
              Мы отправим SMS с кодом подтверждения. Это бесплатно и безопасно
            </Typography>

            <Button
              title="Восстановить вход"
              variant="clear"
              onPress={handleRestoreLogin}
            />
          </View>
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Verify;
