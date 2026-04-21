import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import { Linking, View } from "react-native";
import AuthFooter from "@/src/components/auth/layout/footer";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Typography, Button, StModal } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import {
  VerifySchema,
  type VerifyFormValues,
} from "@/src/validation/schemas/verify.schema";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import { unMask } from "react-native-mask-text";
import { AuthResponse, UserType } from "@/src/store/redux/services/api-types";
import {
  useTelegramLoginMutation,
  useTelegramRegisterMutation,
  useTelegramRegisterStatusQuery,
} from "@/src/store/redux/services/api/authApi";
import { useCountDown } from "@/src/hooks/useCountdown";
import { useAuth } from "@/src/contexts/AuthContext";
import getRedirectPath from "@/src/utils/getOnboardingStep";

const Verify = () => {
  const { login } = useAuth();
  const [telegramRegister, { isLoading }] = useTelegramRegisterMutation();
  const [telegramLogin] = useTelegramLoginMutation();
  const [telegramState, setTelegramState] = useState<{
    uuid: string | null;
    telegramLink: string | null;
    isModalVisible: boolean;
    expiresIn: number | null;
  }>({
    uuid: null,
    telegramLink: null,
    isModalVisible: false,
    expiresIn: null,
  });

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      phone: "",
    },
  });

  const { seconds, start, pause, reset } = useCountDown({
    seconds: telegramState.expiresIn ?? 0,
    autoStart: false,
  });

  const buttonTitle = useMemo(() => {
    if (telegramState.telegramLink) return `Открыть Telegram`;
    return "Получить код";
  }, [telegramState.telegramLink]);

  const { data, error } = useTelegramRegisterStatusQuery(
    { uuid: telegramState.uuid! },
    {
      pollingInterval: 5000,
      skip: !telegramState.uuid || seconds === 0,
    },
  );

  const handleCloseModal = useCallback(() => {
    setTelegramState((prev) => ({ ...prev, isModalVisible: false }));
  }, []);

  const handleOpenTelegram = useCallback(async () => {
    if (!telegramState.telegramLink) return;
    handleCloseModal();
    await Linking.openURL(telegramState.telegramLink);
  }, [telegramState.telegramLink, handleCloseModal]);

  const onSubmit = useCallback(
    async (data: VerifyFormValues) => {
      const phone = `+${unMask(data.phone)}`;

      if (telegramState.telegramLink) {
        setTelegramState((prev) => ({ ...prev, isModalVisible: true }));
        return;
      }

      try {
        const result = await telegramRegister({
          phone,
          type: UserType.USER,
        }).unwrap();

        setTelegramState({
          uuid: result.uuid,
          telegramLink: result.telegram_link,
          expiresIn: result.expires_in,
          isModalVisible: true,
        });
      } catch (error) {
        if (error && typeof error === "object" && "status" in error && error.status === 422) {
          try {
            await telegramLogin({
              phone,
              type: UserType.USER,
            }).unwrap();
          } catch (loginError) {
          }

          router.push({
            pathname: Routers.auth.enterCode,
            params: { phone },
          });
        }
      }
    },
    [telegramState.telegramLink, telegramRegister, telegramLogin],
  );

  const clearState = useCallback(() => {
    pause();
    setTelegramState({
      uuid: null,
      telegramLink: null,
      isModalVisible: false,
      expiresIn: null,
    });
  }, [pause]);

  const handleConfirmed = useCallback(
    async (data: AuthResponse) => {
      try {
        await login(data.token);
        router.replace(getRedirectPath(data.resource));
      } catch (e) {
        console.error("Token save failed:", e);
      }
    },
    [login],
  );

  useEffect(() => {
    if (data?.status === "confirmed" && data.token) {
      handleConfirmed(data);
      return;
    }

    if (error && "status" in error && error.status === 404) {
      clearState();
      return;
    }
  }, [data, error, clearState, handleConfirmed]);

  useEffect(() => {
    if (telegramState.expiresIn) {
      reset();
      start();
    }
  }, [reset, start, telegramState.expiresIn]);

  const handleRestoreLogin = useCallback(() => {
    router.push(Routers.auth.restoreLogin);
  }, []);

  return (
    <>
      <FormProvider {...methods}>
        <AuthScreenLayout
          avoidKeyboard
          header={<AuthHeader />}
          footer={
            <AuthFooter
              primary={{
                title: buttonTitle,
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
                Мы отправим код подтверждения в Telegram. Это бесплатно и
                безопасно
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

      <StModal
        visible={telegramState.isModalVisible}
        onClose={handleCloseModal}
      >
        <Typography weight="semibold" className="text-body text-center mb-2">
          Подтвердите номер
        </Typography>

        <Typography
          weight="regular"
          className="text-neutral-500 text-body text-center mb-6"
        >
          Для подтверждения номера перейдите в Telegram и нажмите кнопку «Start»
          в боте.
        </Typography>

        <Button title="Перейти в Telegram" onPress={handleOpenTelegram} />

        <Button title="Отмена" variant="clear" onPress={handleCloseModal} />
      </StModal>
    </>
  );
};

export default Verify;
