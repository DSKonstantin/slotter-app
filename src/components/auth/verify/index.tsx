import React, { useCallback, useEffect, useRef, useState } from "react";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import { Linking, View } from "react-native";
import AuthFooter from "@/src/components/auth/layout/footer";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Typography, Button, StModal } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Routers } from "@/src/constants/routers";
import {
  VerifySchema,
  type VerifyFormValues,
} from "@/src/validation/schemas/verify.schema";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import { unMask } from "react-native-mask-text";
import { UserType } from "@/src/store/redux/services/api-types";
import { useSendCodeMutation } from "@/src/store/redux/services/api/authApi";
import { useLazyValidateReferralCodeQuery } from "@/src/store/redux/services/api/referralApi";
import { useAppSelector } from "@/src/store/redux/store";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";

const TELEGRAM_BOT = process.env.EXPO_PUBLIC_TELEGRAM_BOT_USERNAME ?? "";

type CodeState = { status: "idle" | "valid" | "invalid"; error: string };

const INITIAL_CODE_STATE: CodeState = { status: "idle", error: "" };

const Verify = () => {
  const [codeState, setCodeState] = useState<CodeState>(INITIAL_CODE_STATE);
  const [showTelegramStep, setShowTelegramStep] = useState(false);
  const pendingData = useRef<VerifyFormValues | null>(null);

  const ispe = useAppSelector((s) => s.appVersion.ispe);
  const [sendCode, { isLoading }] = useSendCodeMutation();
  const [validateReferralCode, { isFetching: isValidating }] =
    useLazyValidateReferralCodeQuery();

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      phone: "",
      promoCode: "",
    },
  });

  const promoCode = methods.watch("promoCode") ?? "";

  const handleValidateCode = useCallback(async () => {
    const code = promoCode.trim();
    if (!code) return;
    try {
      const result = await validateReferralCode({ code }).unwrap();
      if (result.valid) {
        setCodeState({ status: "valid", error: "" });
      } else {
        setCodeState({ status: "invalid", error: result.error });
      }
    } catch {
      setCodeState({ status: "invalid", error: "Не удалось проверить код" });
    }
  }, [promoCode, validateReferralCode]);

  const handleOpenTelegram = useCallback(() => {
    Linking.openURL(`https://t.me/${TELEGRAM_BOT}`);
  }, []);

  const handleSendCode = useCallback(async () => {
    const data = pendingData.current;
    if (!data) return;
    const code = (data.promoCode ?? "").trim();
    const phone = `+${unMask(data.phone)}`;
    try {
      await sendCode({ phone, type: UserType.USER }).unwrap();
      setShowTelegramStep(false);
      router.push({
        pathname: Routers.auth.enterCode,
        params: {
          phone,
          ...(code && { referralCode: code }),
        },
      });
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
    }
  }, [sendCode]);

  const onSubmit = useCallback((data: VerifyFormValues) => {
    pendingData.current = data;
    setShowTelegramStep(true);
  }, []);

  const trimmedPromo = promoCode.trim();
  const isPromoEntered = trimmedPromo.length >= 4;

  useEffect(() => {
    setCodeState(INITIAL_CODE_STATE);
  }, [promoCode]);

  return (
    <FormProvider {...methods}>
      <StModal
        visible={showTelegramStep}
        onClose={() => setShowTelegramStep(false)}
      >
        <View className="gap-4 pt-2 pb-2">
          <View className="gap-1">
            <Typography weight="semibold" className="text-display">
              Откройте бота в Telegram
            </Typography>
            <Typography className="text-body text-neutral-500">
              Перед отправкой кода нажмите Старт в нашем боте — это нужно
              сделать один раз
            </Typography>
          </View>
          <Button title="Открыть Telegram" onPress={handleOpenTelegram} />
          <Button
            title="Я нажал Старт — отправить код"
            variant="secondary"
            loading={isLoading}
            disabled={isLoading}
            onPress={handleSendCode}
          />
        </View>
      </StModal>

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
            Отправим код в Telegram
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
            <Typography className="text-caption text-neutral-500 mt-2 mb-9">
              Продолжая, вы соглашаетесь с{" "}
              <Typography
                className="text-caption text-black underline"
                onPress={() =>
                  WebBrowser.openBrowserAsync(
                    `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/terms`,
                  )
                }
              >
                условиями использования
              </Typography>
            </Typography>
            {ispe && (
              <>
                <RhfTextField
                  name="promoCode"
                  label="Если вас пригласили или вы попали на акцию"
                  placeholder="Промокод"
                  hideErrorText
                  autoCapitalize="characters"
                  maxLength={16}
                />
                <View className="mt-2">
                  <Button
                    title="Проверить"
                    variant="secondary"
                    size="sm"
                    loading={isValidating}
                    disabled={!isPromoEntered || isValidating}
                    onPress={handleValidateCode}
                  />
                </View>
                {codeState.status === "valid" && (
                  <Typography className="text-caption text-accent-green-500 mt-2">
                    Вы получите 30 дней Pro бесплатно
                  </Typography>
                )}
                {codeState.status === "invalid" && (
                  <Typography className="text-caption text-accent-red-500 mt-2">
                    {codeState.error}
                  </Typography>
                )}
              </>
            )}
          </View>
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Verify;
