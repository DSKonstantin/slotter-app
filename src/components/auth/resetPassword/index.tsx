import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { unMask } from "react-native-mask-text";
import { toast } from "@backpackapp-io/react-native-toast";
import { Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { useSendCodeMutation } from "@/src/store/redux/services/api/authApi";
import { UserType } from "@/src/store/redux/services/api-types";
import { getApiErrorCode, getApiErrorMessage } from "@/src/utils/apiError";
import { setToken } from "@/src/store/redux/slices/authSlice";
import { useAppDispatch } from "@/src/store/redux/store";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import { Routers } from "@/src/constants/routers";
import {
  resetPasswordPhoneSchema,
  type ResetPasswordPhoneValues,
} from "@/src/validation/schemas/resetPassword.schema";
import { useCallbackSession } from "@/src/components/auth/useCallbackSession";
import { CallModal } from "@/src/components/auth/verify/CallModal";

const ResetPasswordPhone = () => {
  const [isSwitchingToFlashcall, setIsSwitchingToFlashcall] = useState(false);
  const [sendCode, { isLoading }] = useSendCodeMutation();

  const pendingRouteRef = useRef<Parameters<typeof router.push>[0] | null>(
    null,
  );

  const dispatch = useAppDispatch();

  const methods = useForm<ResetPasswordPhoneValues>({
    resolver: yupResolver(resetPasswordPhoneSchema),
    defaultValues: { phone: "" },
  });

  const rawPhone = methods.watch("phone");
  const sessionPhone = `+${unMask(rawPhone)}`;

  const onCallbackAuthorized = useCallback(
    (token: string) => {
      dispatch(setToken(token));
      router.push({
        pathname: Routers.resetPassword.newPassword,
        params: { phone: sessionPhone },
      });
    },
    [dispatch, sessionPhone],
  );

  const { callSession, setCallSession, handleResend } = useCallbackSession({
    phone: sessionPhone,
    onAuthorized: onCallbackAuthorized,
  });

  const handleSwitchToFlashcall = useCallback(async () => {
    const phone = `+${unMask(methods.getValues("phone"))}`;
    setIsSwitchingToFlashcall(true);
    try {
      const result = await sendCode({
        phone,
        type: UserType.USER,
        method: "flashcall",
      }).unwrap();
      pendingRouteRef.current = {
        pathname: Routers.resetPassword.verify,
        params: {
          phone,
          method: "flashcall",
          ...(result.code_length != null && {
            code_length: String(result.code_length),
          }),
          resend_after: String(result.resend_after),
          expires_in: String(result.expires_in),
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

  // 5. useCallback
  const onSubmit = useCallback(
    async ({ phone }: ResetPasswordPhoneValues) => {
      const normalizedPhone = `+${unMask(phone)}`;
      try {
        const result = await sendCode({
          phone: normalizedPhone,
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
        }
      } catch (error) {
        const code = getApiErrorCode(error);
        if (code === "not_found") {
          toast.error("Аккаунт с таким номером не найден");
        } else if (code === "account_deactivated") {
          toast.error("Аккаунт деактивирован");
        } else {
          toast.error(getApiErrorMessage(error, "Не удалось отправить код"));
        }
      }
    },
    [sendCode, setCallSession],
  );

  useEffect(() => {
    if (callSession || !pendingRouteRef.current) return;
    const route = pendingRouteRef.current;
    pendingRouteRef.current = null;
    router.push(route);
  }, [callSession]);

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        avoidKeyboard
        footer={
          <AuthFooter
            primary={{
              title: "Продолжить",
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
            Введите номер телефона, подтвердите его звонком и задайте новый
            пароль
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

export default ResetPasswordPhone;
