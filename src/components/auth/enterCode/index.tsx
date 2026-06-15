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
  const isFlashcall = params.method !== "telegram";
  const codeLength = Number(params.code_length ?? "4");
  const initialResendAfter = Number(params.resend_after ?? "60");

  // 1. useState
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [wrongCode, setWrongCode] = useState<{
    attemptsLeft: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFlashcallFallback, setShowFlashcallFallback] = useState(false);
  const [currentResendAfter, setCurrentResendAfter] = useState(initialResendAfter);
  const [flashcallKey, setFlashcallKey] = useState(0);

  // 3. Custom hooks + RTK Query
  const { login } = useAuth();
  const [confirmCode] = useConfirmCodeMutation();
  const [sendCode] = useSendCodeMutation();

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
      const result = await sendCode({
        phone,
        type: UserType.USER,
        method: "flashcall",
      }).unwrap();
      setWrongCode(null);
      setShowFlashcallFallback(false);
      setCurrentResendAfter(result.resend_after);
      setFlashcallKey((k) => k + 1);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
    }
  }, [sendCode, phone]);

  // 6. useEffect
  // Flashcall: show fallback options after 45 seconds; resets on each resend
  useEffect(() => {
    if (!isFlashcall) return;
    const timeout = setTimeout(
      () => setShowFlashcallFallback(true),
      FLASHCALL_FALLBACK_DELAY_MS,
    );
    return () => clearTimeout(timeout);
  }, [isFlashcall, flashcallKey]);

  // Таймер истечения + polling — оба живут пока callSession != null
  useEffect(() => {
    if (!callSession) return;

    const expiryTimeout = setTimeout(() => {
      setCallSession(null);
      toast.error("Сессия истекла. Попробуйте снова");
    }, callSession.expires_in * 1000);

    const pollInterval = setInterval(async () => {
      try {
        const result = await confirmCode({
          phone,
          type: UserType.USER,
          ...(referralCode && { referral_code: referralCode }),
        }).unwrap();
        if (result.status === "authorized") {
          setCallSession(null);
          await handleAuthorized(result.token, result.resource);
        } else if (
          result.status === "expired" ||
          result.status === "deactivated"
        ) {
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

    return () => {
      clearTimeout(expiryTimeout);
      clearInterval(pollInterval);
    };
  }, [callSession, phone, referralCode, confirmCode, handleAuthorized]);

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
            key={flashcallKey}
            length={codeLength}
            onChange={() => setWrongCode(null)}
            onComplete={handleOtpComplete}
            onResend={handleResend}
            disabled={isSubmitting}
            resendSeconds={currentResendAfter}
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

      {!!callSession && (
        <CallModal
          visible
          onClose={() => setCallSession(null)}
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
