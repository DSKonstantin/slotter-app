import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";

import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import { OtpConfirm } from "@/src/components/auth/enterCode/otpConfirm";
import { CallModal } from "@/src/components/auth/verify/CallModal";
import { Typography } from "@/src/components/ui";
import {
  useConfirmCodeMutation,
  useCreateTelegramIntentMutation,
  useLazyGetTelegramSessionQuery,
  useSendCodeMutation,
} from "@/src/store/redux/services/api/authApi";
import type { User } from "@/src/store/redux/services/api-types";
import { UserType } from "@/src/store/redux/services/api-types";
import { useAuth } from "@/src/contexts/AuthContext";
import { colors } from "@/src/styles/colors";
import getRedirectPath from "@/src/utils/getOnboardingStep";
import { getApiErrorMessage } from "@/src/utils/apiError";

type VerifyMode = "flashcall" | "telegram";

type CallSession = {
  call_phone: string;
  poll_interval: number;
  resend_after: number;
  expires_in: number;
};

const FLASHCALL_FALLBACK_DELAY_MS = 45_000;

const EnterCode = () => {
  const params = useLocalSearchParams<{
    phone?: string;
    referralCode?: string;
    method?: string;
    code_length?: string;
    resend_after?: string;
    telegram_code?: string;
    poll_interval?: string;
  }>();

  const phone = String(params.phone ?? "");
  const referralCode = params.referralCode
    ? String(params.referralCode)
    : undefined;
  const initialMethod: VerifyMode =
    params.method === "telegram" ? "telegram" : "flashcall";
  const codeLength = Number(params.code_length ?? "4");
  const resendAfter = Number(params.resend_after ?? "60");
  const telegramCodeFromParams = params.telegram_code
    ? String(params.telegram_code)
    : null;
  const pollIntervalFromParams = Number(params.poll_interval ?? "3");

  // 1. useState
  const [mode, setMode] = useState<VerifyMode>(initialMethod);
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [wrongCode, setWrongCode] = useState<{
    attemptsLeft: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFlashcallFallback, setShowFlashcallFallback] = useState(false);
  const [telegramPolling, setTelegramPolling] = useState<{
    code: string;
    interval: number;
  } | null>(
    telegramCodeFromParams
      ? { code: telegramCodeFromParams, interval: pollIntervalFromParams }
      : null,
  );
  const [telegramStatus, setTelegramStatus] = useState<
    "pending" | "awaiting_contact"
  >("pending");

  // 3. Custom hooks + RTK Query
  const { login } = useAuth();
  const [confirmCode] = useConfirmCodeMutation();
  const [sendCode] = useSendCodeMutation();
  const [createTelegramIntent, { isLoading: isStartingTelegram }] =
    useCreateTelegramIntentMutation();
  const [fetchTelegramSession] = useLazyGetTelegramSessionQuery();

  // 5. useCallback
  const handleAuthorized = useCallback(
    async (token: string, resource: User) => {
      await login(token);
      router.replace(getRedirectPath(resource));
    },
    [login],
  );

  const handleExpiredOrDeactivated = useCallback(
    (status: "expired" | "deactivated") => {
      toast.error(
        status === "deactivated"
          ? "Аккаунт деактивирован"
          : "Сессия истекла. Попробуйте снова",
      );
      router.back();
    },
    [],
  );

  const handleOtpComplete = useCallback(
    async (code: string) => {
      setIsSubmitting(true);
      setWrongCode(null);
      try {
        const result = await confirmCode({
          phone,
          type: UserType.USER,
          code,
          ...(referralCode && { referral_code: referralCode }),
        }).unwrap();

        if (result.status === "authorized") {
          await handleAuthorized(result.token, result.resource);
        } else if (result.status === "wrong_code") {
          setWrongCode({ attemptsLeft: result.attempts_left });
        } else if (
          result.status === "expired" ||
          result.status === "deactivated"
        ) {
          handleExpiredOrDeactivated(result.status);
        }
      } catch (e) {
        toast.error(getApiErrorMessage(e, "Ошибка подтверждения"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      phone,
      referralCode,
      confirmCode,
      handleAuthorized,
      handleExpiredOrDeactivated,
    ],
  );

  // TODO: Telegram временно отключён
  // const handleSwitchToTelegram = useCallback(async () => {
  //   try {
  //     const result = await createTelegramIntent({ type: UserType.USER }).unwrap();
  //     Linking.openURL(result.url);
  //     setTelegramPolling({ code: result.code, interval: result.poll_interval });
  //     setTelegramStatus("pending");
  //     setMode("telegram");
  //   } catch (e) {
  //     toast.error(getApiErrorMessage(e, "Не удалось запустить вход через Telegram"));
  //   }
  // }, [createTelegramIntent]);

  const handleSwitchToCallback = useCallback(async () => {
    try {
      const result = await sendCode({
        phone,
        type: UserType.USER,
        method: "callback",
      }).unwrap();
      if (result.call_phone) {
        setCallSession({
          call_phone: result.call_phone,
          poll_interval: result.poll_interval,
          resend_after: result.resend_after,
          expires_in: result.expires_in,
        });
        setCallModalVisible(true);
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
    }
  }, [sendCode, phone]);

  const handleCallbackResend = useCallback(async () => {
    try {
      const result = await sendCode({
        phone,
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
  }, [sendCode, phone]);

  const handleResend = useCallback(async () => {
    try {
      await sendCode({
        phone,
        type: UserType.USER,
        method: "flashcall",
      }).unwrap();
      setWrongCode(null);
      setShowFlashcallFallback(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
    }
  }, [sendCode, phone]);

  // 6. useEffect
  // Flashcall: show fallback options after 45 seconds
  useEffect(() => {
    if (mode !== "flashcall") return;
    const timeout = setTimeout(
      () => setShowFlashcallFallback(true),
      FLASHCALL_FALLBACK_DELAY_MS,
    );
    return () => clearTimeout(timeout);
  }, [mode]);

  // Callback fallback: expires_in timeout
  useEffect(() => {
    if (!callSession) return;
    const timeout = setTimeout(() => {
      setCallModalVisible(false);
      setCallSession(null);
      toast.error("Сессия истекла. Попробуйте снова");
    }, callSession.expires_in * 1000);
    return () => clearTimeout(timeout);
  }, [callSession]);

  // Callback fallback: polling while modal is open
  useEffect(() => {
    if (!callModalVisible || !callSession) return;
    const interval = setInterval(async () => {
      try {
        const result = await confirmCode({
          phone,
          type: UserType.USER,
          ...(referralCode && { referral_code: referralCode }),
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
  }, [
    callModalVisible,
    callSession,
    phone,
    referralCode,
    confirmCode,
    handleAuthorized,
  ]);

  // TODO: Telegram временно отключён
  // useEffect(() => {
  //   if (mode !== "telegram" || !telegramPolling) return;
  //   const { code, interval: tInterval } = telegramPolling;
  //   const interval = setInterval(async () => {
  //     try {
  //       const result = await fetchTelegramSession({ code }).unwrap();
  //       if (result.status === "authorized") {
  //         clearInterval(interval);
  //         await handleAuthorized(result.token, result.resource);
  //       } else if (result.status === "awaiting_contact") {
  //         setTelegramStatus("awaiting_contact");
  //       } else if (result.status === "expired") {
  //         clearInterval(interval);
  //         setMode("flashcall");
  //         setTelegramPolling(null);
  //         toast("Ссылка Telegram истекла. Попробуйте снова");
  //       } else if (result.status === "deactivated") {
  //         clearInterval(interval);
  //         handleExpiredOrDeactivated("deactivated");
  //       }
  //     } catch {}
  //   }, tInterval * 1000);
  //   return () => clearInterval(interval);
  // }, [mode, telegramPolling, fetchTelegramSession, handleAuthorized, handleExpiredOrDeactivated]);

  // TODO: Telegram временно отключён
  // if (mode === "telegram") {
  //   return (
  //     <AuthScreenLayout
  //       header={<AuthHeader />}
  //       footer={
  //         <AuthFooter
  //           primary={{ title: "Открыть Telegram", onPress: () => { if (telegramPolling) Linking.openURL(`https://t.me/${process.env.EXPO_PUBLIC_TELEGRAM_BOT_USERNAME}`); } }}
  //           secondary={{ title: "Вернуться назад", variant: "secondary", onPress: () => { setMode("flashcall"); setTelegramPolling(null); } }}
  //         />
  //       }
  //     >
  //       <View className="mt-14">
  //         <Typography weight="semibold" className="text-display mb-2">Войдите через Telegram</Typography>
  //         <Typography className="text-body text-neutral-500">
  //           {telegramStatus === "awaiting_contact" ? "Нажмите «Поделиться номером» в боте Telegram" : "Откройте бота и следуйте инструкции"}
  //         </Typography>
  //         <View className="flex-row items-center gap-2 mt-8">
  //           <ActivityIndicator color={colors.primary.green[500]} />
  //           <Typography className="text-caption text-neutral-500">Ожидаем подтверждение...</Typography>
  //         </View>
  //       </View>
  //     </AuthScreenLayout>
  //   );
  // }

  // flashcall
  return (
    <AuthScreenLayout
      avoidKeyboard
      header={<AuthHeader />}
      footer={
        showFlashcallFallback ? (
          <AuthFooter
            primary={{
              title: "Подтвердить звонком",
              onPress: handleSwitchToCallback,
            }}
            // TODO: Telegram временно отключён
            // secondary={{
            //   title: "Войти через Telegram",
            //   variant: "secondary",
            //   loading: isStartingTelegram,
            //   disabled: isStartingTelegram,
            //   onPress: handleSwitchToTelegram,
            // }}
          />
        ) : undefined
      }
    >
      <View className="mt-14">
        <Typography weight="semibold" className="text-display mb-2">
          Введите последние {codeLength} цифры
        </Typography>
        <Typography className="text-body text-neutral-500">
          Вам поступит входящий звонок — введите последние {codeLength} цифры
          номера
        </Typography>

        <View className="mt-8">
          <OtpConfirm
            length={codeLength}
            onChange={() => setWrongCode(null)}
            onComplete={handleOtpComplete}
            onResend={handleResend}
            disabled={isSubmitting}
            resendSeconds={resendAfter}
          />
          {wrongCode && (
            <Typography className="text-caption text-accent-red-500 mt-3 text-center">
              Неверный код. Осталось попыток: {wrongCode.attemptsLeft}
            </Typography>
          )}
        </View>

        {showFlashcallFallback && (
          <Typography className="text-caption text-neutral-500 mt-4 text-center">
            Звонок не пришёл? Выберите другой способ входа
          </Typography>
        )}
      </View>

      {callSession && (
        <CallModal
          visible={callModalVisible}
          onClose={() => setCallModalVisible(false)}
          call_phone={callSession.call_phone}
          resendAfter={callSession.resend_after}
          onResend={handleCallbackResend}
          // TODO: Telegram временно отключён
          // onSwitchToTelegram={handleSwitchToTelegram}
          // isSwitchingToTelegram={isStartingTelegram}
        />
      )}
    </AuthScreenLayout>
  );
};

export default EnterCode;
