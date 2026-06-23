import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";

import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import { OtpConfirm } from "@/src/components/auth/enterCode/otpConfirm";
import { CallModal } from "@/src/components/auth/verify/CallModal";
import { useCallbackSession } from "@/src/components/auth/useCallbackSession";
import { useHandleAuthorized } from "@/src/components/auth/useHandleAuthorized";
import { Typography } from "@/src/components/ui";
import {
  useConfirmCodeMutation,
  useSendCodeMutation,
} from "@/src/store/redux/services/api/authApi";
import { UserType } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";

const FLASHCALL_FALLBACK_DELAY_MS = 45_000;

const EnterCode = () => {
  const params = useLocalSearchParams<{
    phone?: string;
    referralCode?: string;
    method?: string;
    code_length?: string;
    resend_after?: string;
    expires_in?: string;
  }>();

  const phone = String(params.phone ?? "");
  const referralCode = params.referralCode
    ? String(params.referralCode)
    : undefined;
  const isFlashcall = params.method !== "telegram";
  const codeLength = Number(params.code_length ?? "4");
  const initialResendAfter = Number(params.resend_after ?? "60");

  // 1. useState
  const [wrongCode, setWrongCode] = useState<{
    attemptsLeft: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFlashcallFallback, setShowFlashcallFallback] = useState(false);
  const [currentResendAfter, setCurrentResendAfter] =
    useState(initialResendAfter);
  const [flashcallKey, setFlashcallKey] = useState(0);

  // 3. Custom hooks + RTK Query
  const handleAuthorized = useHandleAuthorized();
  const [confirmCode] = useConfirmCodeMutation();
  const [sendCode, { isLoading: isSendingCode }] = useSendCodeMutation();
  const { callSession, setCallSession } = useCallbackSession({
    phone,
    referralCode,
  });

  // 5. useCallback
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
  }, [sendCode, phone, setCallSession]);

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

  return (
    <AuthScreenLayout
      avoidKeyboard
      header={<AuthHeader />}
      footer={
        showFlashcallFallback && !callSession ? (
          <AuthFooter
            primary={{
              title: "Подтвердить звонком",
              loading: isSendingCode,
              disabled: isSendingCode,
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

        {showFlashcallFallback && !callSession && (
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
          expiresIn={callSession.expires_in}
        />
      )}
    </AuthScreenLayout>
  );
};

export default EnterCode;
