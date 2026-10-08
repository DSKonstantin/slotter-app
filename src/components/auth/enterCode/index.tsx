import React, { useCallback, useEffect, useState } from "react";
import { Linking, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { toast } from "@/src/components/ui/toast";

import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import { OtpConfirm } from "@/src/components/auth/enterCode/otpConfirm";
import { useAccountDeactivatedModal } from "@/src/components/auth/useAccountDeactivatedModal";
import type { AuthFlow } from "@/src/components/auth/enterCode/route";
import { SubtitleWithPhone } from "@/src/components/auth/enterCode/SubtitleWithPhone";
import { useHandleAuthorized } from "@/src/components/auth/useHandleAuthorized";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import {
  useConfirmCodeMutation,
  useSendCodeMutation,
} from "@/src/store/redux/services/api/authApi";
import {
  trackAuthCodeFailed,
  trackAuthFallbackToCall,
  trackAuthSuccess,
} from "@/src/services/analytics";
import { setToken } from "@/src/store/redux/slices/authSlice";
import { useAppDispatch } from "@/src/store/redux/store";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import { Routers } from "@/src/constants/routers";
import { UserType } from "@/src/store/redux/services/api-types";
import { getApiErrorCode, getApiErrorMessage } from "@/src/utils/apiError";
import {
  CODE_METHODS,
  codeSessionFromResponse,
  resolveCodeMethod,
  toCodeSession,
} from "@/src/components/auth/enterCode/codeMethods";

const EnterCode = () => {
  const params = useLocalSearchParams<{
    phone?: string;
    referralCode?: string;
    method?: string;
    code_length?: string;
    resend_after?: string;
    expires_in?: string;
    bot_url?: string;
    flow?: string;
  }>();

  const phone = String(params.phone ?? "");
  const referralCode = params.referralCode
    ? String(params.referralCode)
    : undefined;
  const flow: AuthFlow = params.flow === "reset" ? "reset" : "login";
  const method = resolveCodeMethod(params.method);
  const config = CODE_METHODS[method];
  const codeLength = Number(params.code_length ?? config.defaultCodeLength);
  const initialResendAfter = Number(params.resend_after ?? "60");
  const formattedPhone = maskPhone(phone);
  const subtitle = config.subtitle(codeLength, formattedPhone);

  const [wrongCode, setWrongCode] = useState<{
    attemptsLeft: number;
  } | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [currentResendAfter, setCurrentResendAfter] =
    useState(initialResendAfter);
  const [resendKey, setResendKey] = useState(0);
  const [session, setSession] = useState(() => toCodeSession(params));
  const [isExpired, setIsExpired] = useState(false);

  const dispatch = useAppDispatch();
  const { show: showAccountDeactivated, modal: accountDeactivatedModal } =
    useAccountDeactivatedModal();
  const handleAuthorized = useHandleAuthorized();
  const [confirmCode] = useConfirmCodeMutation();
  const [sendCode] = useSendCodeMutation();

  const handleExpired = useCallback(() => {
    setIsExpired(true);
    setOtpValue("");
    setCurrentResendAfter(0);
    setResendKey((k) => k + 1);
  }, []);

  const handleOtpComplete = useCallback(
    async (code: string) => {
      setIsSubmitting(true);
      setWrongCode(null);
      try {
        const result = await confirmCode({
          phone,
          type: UserType.USER,
          code,
          ...(config.confirmMethod && { method: config.confirmMethod }),
          ...(flow === "login" &&
            referralCode && { referral_code: referralCode }),
        }).unwrap();

        if (result.status === "authorized") {
          trackAuthSuccess({ method, flow, isCreated: result.is_created });
          if (flow === "reset") {
            dispatch(setToken(result.token));
            router.push({
              pathname: Routers.resetPassword.newPassword,
              params: { phone },
            });
          } else {
            await handleAuthorized(result.token, result.resource);
          }
        } else if (result.status === "wrong_code") {
          trackAuthCodeFailed(method, flow, "wrong_code");
          setWrongCode({ attemptsLeft: result.attempts_left });
        } else if (result.status === "expired") {
          trackAuthCodeFailed(method, flow, "expired");
          handleExpired();
        } else if (result.status === "deactivated") {
          trackAuthCodeFailed(method, flow, "deactivated");
          showAccountDeactivated();
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
      config.confirmMethod,
      method,
      flow,
      dispatch,
      confirmCode,
      handleAuthorized,
      handleExpired,
      showAccountDeactivated,
    ],
  );

  const handleConfirmByCall = useCallback(() => {
    trackAuthFallbackToCall(method, flow);
    router.dismissTo({
      pathname:
        flow === "reset" ? Routers.resetPassword.root : Routers.auth.verify,
      params: { openMethods: "call" },
    });
  }, [method, flow]);

  const handleSubmitPress = useCallback(() => {
    if (otpValue.length !== codeLength) return;
    handleOtpComplete(otpValue);
  }, [otpValue, codeLength, handleOtpComplete]);

  const handleOpenLink = useCallback(async () => {
    if (!session.link) return;
    try {
      await Linking.openURL(session.link);
    } catch {
      toast.error(config.link?.openError ?? "Не удалось открыть ссылку");
    }
  }, [session.link, config.link?.openError]);

  const handleResend = useCallback(async () => {
    try {
      const result = await sendCode({
        phone,
        type: UserType.USER,
        method,
      }).unwrap();
      setWrongCode(null);
      setIsExpired(false);
      setShowFallback(false);
      setCurrentResendAfter(result.resend_after);
      const nextSession = codeSessionFromResponse(result);
      setSession(nextSession);
      setResendKey((k) => k + 1);
    } catch (e) {
      const code = getApiErrorCode(e) ?? "";
      trackAuthCodeFailed(method, flow, code || "unknown");
      const message = config.errors[code];
      if (code === "account_deactivated") {
        showAccountDeactivated();
      } else if (message) {
        setShowFallback(true);
        toast.error(message);
      } else {
        toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
      }
    }
  }, [sendCode, phone, method, flow, config.errors, showAccountDeactivated]);

  useEffect(() => {
    const timeout = setTimeout(
      () => setShowFallback(true),
      config.fallbackDelayMs,
    );
    return () => clearTimeout(timeout);
  }, [config.fallbackDelayMs, resendKey]);

  return (
    <AuthScreenLayout
      avoidKeyboard
      stickyFooter
      header={<AuthHeader />}
      footer={
        <AuthFooter
          primary={{
            title: "Далее",
            loading: isSubmitting,
            disabled: otpValue.length !== codeLength || isSubmitting,
            onPress: handleSubmitPress,
          }}
          secondary={
            showFallback
              ? {
                  title: "Подтвердить звонком",
                  variant: "secondary",
                  onPress: handleConfirmByCall,
                }
              : undefined
          }
        />
      }
    >
      <View className="mt-8">
        <Typography weight="semibold" className="text-display mb-2">
          {config.title(codeLength)}
        </Typography>
        <SubtitleWithPhone text={subtitle} phone={formattedPhone} />

        {config.link && !!session.link && (
          <View className="mt-6">
            <Button
              title={config.link.title}
              variant="accent"
              leftIcon={
                <StSvg
                  name={config.link.icon}
                  size={24}
                  color={colors.secondary.DEFAULT}
                />
              }
              rightIcon={
                <View className="absolute right-4 top-0 bottom-0 justify-center">
                  <StSvg
                    name="Expand_right"
                    size={24}
                    color={colors.secondary.DEFAULT}
                  />
                </View>
              }
              onPress={handleOpenLink}
            />
          </View>
        )}

        <View className="mt-8">
          <OtpConfirm
            key={resendKey}
            length={codeLength}
            onChange={(value) => {
              setWrongCode(null);
              if (value.length > 0) setIsExpired(false);
              setOtpValue(value);
            }}
            onResend={handleResend}
            disabled={isSubmitting}
            resendSeconds={currentResendAfter}
            resendLabel={config.resendLabel}
          />
          {isExpired && (
            <Typography className="text-caption text-accent-red-500 mt-3 text-center">
              {config.expiredText}
            </Typography>
          )}
          {wrongCode && (
            <Typography className="text-caption text-accent-red-500 mt-3 text-center">
              Неверный код. Осталось попыток: {wrongCode.attemptsLeft}
            </Typography>
          )}
        </View>

        {showFallback && (
          <Typography className="text-caption text-neutral-500 mt-4 text-center">
            {config.fallbackHint}
          </Typography>
        )}
      </View>

      {accountDeactivatedModal}
    </AuthScreenLayout>
  );
};

export default EnterCode;
