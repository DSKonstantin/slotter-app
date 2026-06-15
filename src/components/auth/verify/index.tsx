import React, { useCallback, useEffect, useRef, useState } from "react";
import { Linking, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "@backpackapp-io/react-native-toast";
import { unMask } from "react-native-mask-text";

import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { CallModal } from "@/src/components/auth/verify/CallModal";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { Button, Typography } from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";
import {
  useConfirmCodeMutation,
  useCreateTelegramIntentMutation,
  useSendCodeMutation,
} from "@/src/store/redux/services/api/authApi";
import { useLazyValidateReferralCodeQuery } from "@/src/store/redux/services/api/referralApi";
import type { User } from "@/src/store/redux/services/api-types";
import { UserType } from "@/src/store/redux/services/api-types";
import { useAppSelector } from "@/src/store/redux/store";
import { useAuth } from "@/src/contexts/AuthContext";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import getRedirectPath from "@/src/utils/getOnboardingStep";
import { getApiErrorCode, getApiErrorMessage } from "@/src/utils/apiError";
import {
  VerifySchema,
  type VerifyFormValues,
} from "@/src/validation/schemas/verify.schema";

type CodeState = { status: "idle" | "valid" | "invalid"; error: string };

const INITIAL_CODE_STATE: CodeState = { status: "idle", error: "" };

type CallSession = {
  call_phone: string;
  poll_interval: number;
  resend_after: number;
  expires_in: number;
};

const Verify = () => {
  // 1. useState
  const [codeState, setCodeState] = useState<CodeState>(INITIAL_CODE_STATE);
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [sendCodeError, setSendCodeError] = useState<
    "spend_unavailable" | null
  >(null);

  // 2. useRef
  const sessionDataRef = useRef<{
    phone: string;
    referralCode?: string;
  } | null>(null);

  // 3. Custom hooks + RTK Query
  const ispe = useAppSelector((s) => s.appVersion.ispe);
  const [sendCode, { isLoading }] = useSendCodeMutation();
  const [validateReferralCode, { isFetching: isValidating }] =
    useLazyValidateReferralCodeQuery();
  const [confirmCode] = useConfirmCodeMutation();
  const [createTelegramIntent, { isLoading: isStartingTelegram }] =
    useCreateTelegramIntentMutation();
  const { login } = useAuth();
  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: { phone: "", promoCode: "" },
  });

  const promoCode = methods.watch("promoCode") ?? "";

  // 5. useCallback
  const handleAuthorized = useCallback(
    async (token: string, resource: User) => {
      await login(token);
      router.replace(getRedirectPath(resource));
    },
    [login],
  );

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

  const onSubmit = useCallback(
    async (data: VerifyFormValues) => {
      const referralCode = (data.promoCode ?? "").trim() || undefined;
      const phone = `+${unMask(data.phone)}`;
      setSendCodeError(null);
      try {
        const result = await sendCode({
          phone,
          type: UserType.USER,
          method: "callback",
        }).unwrap();

        sessionDataRef.current = { phone, referralCode };

        if (result.method === "callback" && result.call_phone) {
          setCallSession({
            call_phone: result.call_phone,
            poll_interval: result.poll_interval,
            resend_after: result.resend_after,
            expires_in: result.expires_in,
          });
          setCallModalVisible(true);
        } else {
          router.push({
            pathname: Routers.auth.enterCode,
            params: {
              phone,
              method: result.method,
              ...(result.code_length != null && {
                code_length: String(result.code_length),
              }),
              poll_interval: String(result.poll_interval),
              resend_after: String(result.resend_after),
              ...(referralCode && { referralCode }),
            },
          });
        }
      } catch (e) {
        const code = getApiErrorCode(e);
        if (code === "spend_unavailable") {
          setSendCodeError("spend_unavailable");
          toast.error("Звонки временно недоступны. Войдите через Telegram");
        } else if (code === "gonec_unavailable") {
          toast.error("Сервис временно недоступен. Попробуйте позже");
        } else {
          toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
        }
      }
    },
    [sendCode],
  );

  const handleResend = useCallback(async () => {
    const session = sessionDataRef.current;
    if (!session) return;
    try {
      const result = await sendCode({
        phone: session.phone,
        type: UserType.USER,
        method: "callback",
      }).unwrap();
      if (result.call_phone) {
        setCallSession((prev) =>
          prev
            ? {
                ...prev,
                call_phone: result.call_phone!,
                resend_after: result.resend_after,
                expires_in: result.expires_in,
              }
            : null,
        );
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
    }
  }, [sendCode]);

  // TODO: Telegram временно отключён
  // const handleSwitchToTelegram = useCallback(async () => {
  //   try {
  //     const result = await createTelegramIntent({ type: UserType.USER }).unwrap();
  //     void Linking.openURL(result.url);
  //     setCallModalVisible(false);
  //     const session = sessionDataRef.current;
  //     router.push({
  //       pathname: Routers.auth.enterCode,
  //       params: {
  //         method: "telegram",
  //         telegram_code: result.code,
  //         poll_interval: String(result.poll_interval),
  //         ...(session?.phone && { phone: session.phone }),
  //       },
  //     });
  //   } catch (e) {
  //     toast.error(getApiErrorMessage(e, "Не удалось запустить вход через Telegram"));
  //   }
  // }, [createTelegramIntent]);

  // 6. useEffect
  useEffect(() => {
    setCodeState(INITIAL_CODE_STATE);
    setSendCodeError(null);
  }, [promoCode]);

  // Сессия истекает по expires_in независимо от состояния модалки
  useEffect(() => {
    if (!callSession) return;
    const timeout = setTimeout(() => {
      setCallModalVisible(false);
      setCallSession(null);
      toast.error("Сессия истекла. Попробуйте снова");
    }, callSession.expires_in * 1000);
    return () => clearTimeout(timeout);
  }, [callSession]);

  // Polling — активен только пока модалка открыта
  useEffect(() => {
    if (!callModalVisible || !callSession) return;
    const session = sessionDataRef.current;
    if (!session) return;

    const interval = setInterval(async () => {
      try {
        const result = await confirmCode({
          phone: session.phone,
          type: UserType.USER,
          ...(session.referralCode && { referral_code: session.referralCode }),
        }).unwrap();

        if (result.status === "authorized") {
          clearInterval(interval);
          setCallModalVisible(false);
          await handleAuthorized(result.token, result.resource);
        } else if (
          result.status === "expired" ||
          result.status === "deactivated"
        ) {
          clearInterval(interval);
          setCallModalVisible(false);
          setCallSession(null);
          toast.error(
            result.status === "deactivated"
              ? "Аккаунт деактивирован"
              : "Сессия истекла. Попробуйте снова",
          );
        }
      } catch {
        // network error — keep trying
      }
    }, callSession.poll_interval * 1000);

    return () => clearInterval(interval);
  }, [callModalVisible, callSession, confirmCode, handleAuthorized]);

  const trimmedPromo = promoCode.trim();
  const isPromoEntered = trimmedPromo.length >= 4;

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        avoidKeyboard
        header={<AuthHeader />}
        footer={
          <AuthFooter
            primary={{
              title: "Продолжить",
              disabled: isLoading,
              loading: isLoading,
              onPress: methods.handleSubmit(onSubmit),
            }}
            // TODO: Telegram временно отключён
            // secondary={
            //   sendCodeError === "spend_unavailable"
            //     ? {
            //         title: "Войти через Telegram",
            //         variant: "secondary",
            //         loading: isStartingTelegram,
            //         disabled: isStartingTelegram,
            //         onPress: handleSwitchToTelegram,
            //       }
            //     : undefined
            // }
          />
        }
      >
        <View className="mt-14">
          <Typography weight="semibold" className="text-display mb-2">
            Твой номер
          </Typography>
          <Typography className="text-body text-neutral-500">
            Введи телефон, и мы покажем способы авторизации
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

      {callSession && (
        <CallModal
          visible={callModalVisible}
          onClose={() => setCallModalVisible(false)}
          call_phone={callSession.call_phone}
          resendAfter={callSession.resend_after}
          onResend={handleResend}
          // TODO: Telegram временно отключён
          // onSwitchToTelegram={handleSwitchToTelegram}
          // isSwitchingToTelegram={isStartingTelegram}
        />
      )}
    </FormProvider>
  );
};

export default Verify;
