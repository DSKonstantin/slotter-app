import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
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
import { useCallbackSession } from "@/src/components/auth/useCallbackSession";
import RhfCheckbox from "@/src/components/hookForm/rhf-checkbox";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { Button, Typography } from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";
import { useSendCodeMutation } from "@/src/store/redux/services/api/authApi";
import { useLazyValidateReferralCodeQuery } from "@/src/store/redux/services/api/referralApi";
import { UserType } from "@/src/store/redux/services/api-types";
import { useAppSelector } from "@/src/store/redux/store";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import { getApiErrorCode, getApiErrorMessage } from "@/src/utils/apiError";
import {
  VerifySchema,
  type VerifyFormValues,
} from "@/src/validation/schemas/verify.schema";

type CodeState = { status: "idle" | "valid" | "invalid"; error: string };

const INITIAL_CODE_STATE: CodeState = { status: "idle", error: "" };

const Verify = () => {
  // 1. useState
  const [codeState, setCodeState] = useState<CodeState>(INITIAL_CODE_STATE);
  const [isSwitchingToFlashcall, setIsSwitchingToFlashcall] = useState(false);

  // 2. useRef
  const pendingRouteRef = useRef<Parameters<typeof router.push>[0] | null>(
    null,
  );

  // 3. Custom hooks + RTK Query
  const ispe = useAppSelector((s) => s.appVersion.ispe);
  const [sendCode, { isLoading }] = useSendCodeMutation();
  const [validateReferralCode, { isFetching: isValidating }] =
    useLazyValidateReferralCodeQuery();
  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      phone: "",
      promoCode: "",
      agreedToTerms: false,
      agreedToPersonalData: false,
    },
  });

  const rawPhone = methods.watch("phone");
  const promoCode = methods.watch("promoCode") ?? "";
  const agreedToTerms = methods.watch("agreedToTerms");
  const sessionPhone = `+${unMask(rawPhone)}`;
  const sessionReferralCode = promoCode.trim() || undefined;

  const { callSession, setCallSession, handleResend } = useCallbackSession({
    phone: sessionPhone,
    referralCode: sessionReferralCode,
  });

  // 5. useCallback
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
      try {
        const result = await sendCode({
          phone,
          type: UserType.USER,
          method: "callback",
        }).unwrap();

        if (result.method === "callback" && result.call_phone) {
          setCallSession({
            call_phone: result.call_phone,
            poll_interval: result.poll_interval,
            resend_after: result.resend_after,
            expires_in: result.expires_in,
          });
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
              expires_in: String(result.expires_in),
              ...(referralCode && { referralCode }),
            },
          });
        }
      } catch (e) {
        const code = getApiErrorCode(e);
        if (code === "spend_unavailable") {
          toast.error("Звонки временно недоступны. Попробуйте позже");
        } else if (code === "gonec_unavailable") {
          toast.error("Сервис временно недоступен. Попробуйте позже");
        } else {
          toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
        }
      }
    },
    [sendCode, setCallSession],
  );

  const handleSwitchToFlashcall = useCallback(async () => {
    const phone = `+${unMask(methods.getValues("phone"))}`;
    const referralCode =
      (methods.getValues("promoCode") ?? "").trim() || undefined;
    setIsSwitchingToFlashcall(true);
    try {
      const result = await sendCode({
        phone,
        type: UserType.USER,
        method: "flashcall",
      }).unwrap();
      pendingRouteRef.current = {
        pathname: Routers.auth.enterCode,
        params: {
          phone,
          method: "flashcall",
          ...(result.code_length != null && {
            code_length: String(result.code_length),
          }),
          resend_after: String(result.resend_after),
          expires_in: String(result.expires_in),
          ...(referralCode && { referralCode }),
        },
      };
      setCallSession(null);
    } catch (e) {
      const code = getApiErrorCode(e);
      if (code === "flashcall_rate_limited") {
        toast.error("Лимит звонков исчерпан. Попробуйте другой способ");
      } else {
        toast.error(getApiErrorMessage(e, "Не удалось отправить звонок"));
      }
    } finally {
      setIsSwitchingToFlashcall(false);
    }
  }, [methods, sendCode, setCallSession]);

  // 6. useEffect
  useEffect(() => {
    setCodeState(INITIAL_CODE_STATE);
  }, [promoCode]);

  useEffect(() => {
    if (callSession || !pendingRouteRef.current) return;
    const route = pendingRouteRef.current;
    pendingRouteRef.current = null;
    router.push(route);
  }, [callSession]);

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
              disabled: isLoading || !agreedToTerms,
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
            <Typography className="text-caption text-neutral-500 mt-2 mb-4">
              Продолжая, вы соглашаетесь с{" "}
              <Typography
                className="text-caption text-black underline"
                onPress={() =>
                  WebBrowser.openBrowserAsync(
                    `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/user-agreement`,
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
                  success={codeState.status === "valid"}
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
                  <Typography className="text-caption text-primary-green-700 mt-2">
                    Промокод действителен
                  </Typography>
                )}
                {codeState.status === "invalid" && (
                  <Typography className="text-caption text-accent-red-500 mt-2">
                    {codeState.error}
                  </Typography>
                )}
              </>
            )}
            <View className="flex-row items-center gap-3 my-3">
              <RhfCheckbox name="agreedToTerms" />
              <Typography className="text-caption text-neutral-700 flex-1">
                Я даю ООО «Slotter» согласие на обработку{" "}
                <Typography
                  className="text-caption text-black underline"
                  onPress={() =>
                    WebBrowser.openBrowserAsync(
                      `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/data-processing`,
                    )
                  }
                >
                  обработку персональных данных
                </Typography>
              </Typography>
            </View>
            <View className="flex-row items-center gap-3 mb-9">
              <RhfCheckbox name="agreedToPersonalData" />
              <Typography className="text-caption text-neutral-700 flex-1">
                Я согласен получать информационные и рекламные сообщения на
                указанный телефон и email{" "}
                <Typography
                  className="text-caption text-black underline"
                  onPress={() =>
                    WebBrowser.openBrowserAsync(
                      `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/data-processing`,
                    )
                  }
                >
                  (условия)
                </Typography>
              </Typography>
            </View>
          </View>
        </View>
      </AuthScreenLayout>

      {!!callSession && (
        <CallModal
          visible
          onClose={() => setCallSession(null)}
          call_phone={callSession.call_phone}
          expiresIn={callSession.expires_in}
          resendAfter={callSession.resend_after}
          onResend={handleResend}
          onSwitchToFlashcall={handleSwitchToFlashcall}
          isSwitchingToFlashcall={isSwitchingToFlashcall}
        />
      )}
    </FormProvider>
  );
};

export default Verify;
