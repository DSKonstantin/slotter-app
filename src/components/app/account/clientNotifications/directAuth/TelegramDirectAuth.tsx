import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { unMask } from "react-native-mask-text";
import { toast } from "@backpackapp-io/react-native-toast";
import { useDispatch } from "react-redux";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Button,
  FloatingFooter,
  Input,
  StModal,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { OtpConfirm } from "@/src/components/auth/enterCode/otpConfirm";
import EyeToggle from "@/src/components/shared/EyeToggle";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import { phoneField } from "@/src/validation/fields/phone";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { api } from "@/src/store/redux/services/api";
import {
  useStartDirectChannelAuthMutation,
  useSubmitDirectChannelAuthCodeMutation,
  useSubmitDirectChannelAuthPasswordMutation,
  useGetDirectChannelAuthStatusQuery,
} from "@/src/store/redux/services/api/subscriptionDirectApi";
import { BOTTOM_OFFSET } from "@/src/constants/tabs";
import type { SubscriptionDirectChannel } from "@/src/store/redux/services/api-types";
import ConnectedStep from "./ConnectedStep";

const KIND = "telegram_direct" as const;

type Step = "phone" | "password" | "connecting" | "connected";

const CODE_LENGTH = 5;

const TelegramDirectAuth = () => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [connectedChannel, setConnectedChannel] =
    useState<SubscriptionDirectChannel | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  const auth = useRequiredAuth();
  const dispatch = useDispatch();

  const [startAuth, { isLoading: isStartingAuth }] =
    useStartDirectChannelAuthMutation();
  const [submitCode, { isLoading: isSubmittingCode }] =
    useSubmitDirectChannelAuthCodeMutation();
  const [submitPassword, { isLoading: isSubmittingPassword }] =
    useSubmitDirectChannelAuthPasswordMutation();

  const { data: statusData } = useGetDirectChannelAuthStatusQuery(
    auth && step === "connecting"
      ? { userId: auth.userId, kind: KIND }
      : skipToken,
    { pollingInterval: step === "connecting" ? 2000 : 0 },
  );

  const handleSendPhone = useCallback(async () => {
    if (!auth) return;
    if (!phoneField.isValidSync(phone)) {
      setPhoneError("Введите корректный номер телефона");
      return;
    }
    setPhoneError(null);
    try {
      await startAuth({
        userId: auth.userId,
        kind: KIND,
        phone: `+${unMask(phone)}`,
      }).unwrap();
      setCode("");
      setIsCodeModalOpen(true);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
    }
  }, [auth, startAuth, phone]);

  const handleResendCode = useCallback(async () => {
    if (!auth) return;
    try {
      await startAuth({
        userId: auth.userId,
        kind: KIND,
        phone: `+${unMask(phone)}`,
      }).unwrap();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
    }
  }, [auth, startAuth, phone]);

  const handleSubmitCode = useCallback(async () => {
    if (!auth) return;
    try {
      const result = await submitCode({
        userId: auth.userId,
        kind: KIND,
        code,
      }).unwrap();
      setIsCodeModalOpen(false);
      setStep(result.needs_password ? "password" : "connecting");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Неверный код"));
    }
  }, [auth, submitCode, code]);

  const handleSendPassword = useCallback(async () => {
    if (!auth || !password) return;
    try {
      await submitPassword({
        userId: auth.userId,
        kind: KIND,
        password,
      }).unwrap();
      setStep("connecting");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Неверный пароль"));
    }
  }, [auth, submitPassword, password]);

  const handleDone = useCallback(() => {
    router.dismissTo(Routers.app.account.clientNotifications.root);
  }, []);

  useEffect(() => {
    if (statusData?.auth_status === "connected") {
      setConnectedChannel(statusData.subscription_direct_channel);
      setStep("connected");
      dispatch(api.util.invalidateTags(["SubscriptionDirectChannels"]));
    }
  }, [statusData, dispatch]);

  const footer =
    step === "phone" ? (
      <Button
        title="Получить код"
        onPress={handleSendPhone}
        loading={isStartingAuth}
        disabled={isStartingAuth}
        variant="accent"
      />
    ) : step === "password" ? (
      <Button
        title="Подтвердить"
        onPress={handleSendPassword}
        loading={isSubmittingPassword}
        disabled={isSubmittingPassword || !password}
        variant="accent"
      />
    ) : step === "connected" ? (
      <Button title="Готово" onPress={handleDone} variant="accent" />
    ) : null;

  return (
    <ScreenWithToolbar title="Подключение рассылки">
      {({ topInset, bottomInset }) => (
        <>
          <KeyboardAwareScrollView
            className="flex-1 px-screen"
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: topInset,
              paddingBottom: bottomInset + step === "connecting" ? 8 : 80,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            bottomOffset={BOTTOM_OFFSET}
          >
            {step === "phone" && (
              <View className="mt-8 flex-1">
                <Typography weight="semibold" className="text-display mb-2">
                  Номер телефона аккаунта
                </Typography>
                <Typography className="text-body text-neutral-500 mb-6">
                  Укажите номер, к которому привязан ваш аккаунт. На него придёт
                  код подтверждения
                </Typography>
                <Input
                  value={phone}
                  onChangeText={(t) => setPhone(maskPhone(t))}
                  label="Телефон"
                  placeholder="+7 999 999-99-99"
                  keyboardType="phone-pad"
                  maxLength={16}
                  hint="Это ваш рабочий аккаунт, с которого пойдут уведомления"
                  editable={!isCodeModalOpen}
                  error={
                    phoneError
                      ? { type: "manual", message: phoneError }
                      : undefined
                  }
                />
              </View>
            )}

            {step === "password" && (
              <View className="mt-8">
                <Typography weight="semibold" className="text-display mb-2">
                  Пароль (2FA)
                </Typography>
                <Typography className="text-body text-neutral-500 mb-6">
                  В вашем аккаунте Telegram включена двухфакторная
                  аутентификация — введите облачный пароль
                </Typography>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  label="Пароль"
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  endAdornment={
                    <EyeToggle
                      visible={showPassword}
                      onPress={() => setShowPassword((v) => !v)}
                    />
                  }
                />
              </View>
            )}

            {step === "connecting" && (
              <View className="flex-1 items-center justify-center gap-4">
                <ActivityIndicator
                  size="large"
                  color={colors.primary.blue[500]}
                />
                <Typography
                  weight="semibold"
                  className="text-display text-center"
                >
                  Привязываем аккаунт…
                </Typography>
                <Typography className="text-body text-neutral-500 text-center">
                  Это займёт несколько минут
                </Typography>
              </View>
            )}

            {step === "connected" && (
              <ConnectedStep channel={connectedChannel} />
            )}
          </KeyboardAwareScrollView>

          {footer && (
            <FloatingFooter offset={bottomInset + 8}>{footer}</FloatingFooter>
          )}

          <StModal
            visible={isCodeModalOpen}
            onClose={() => setIsCodeModalOpen(false)}
            keyboardAware
            swipeDirection={[]}
            onBackdropPress={undefined}
            header={
              <Pressable
                onPress={() => setIsCodeModalOpen(false)}
                hitSlop={8}
                className="absolute top-3 right-4 z-10 active:opacity-70"
              >
                <StSvg
                  name="Close_round"
                  size={24}
                  color={colors.neutral[500]}
                />
              </Pressable>
            }
          >
            <View className="gap-4 mt-4 mb-4">
              <Typography weight="semibold" className="text-display">
                Введите код
              </Typography>
              <Typography className="text-body text-neutral-500">
                Код отправлен в Telegram на номер {phone}
              </Typography>
              <OtpConfirm
                length={CODE_LENGTH}
                onChange={setCode}
                onResend={handleResendCode}
                disabled={isSubmittingCode}
              />
              <Button
                title="Подтвердить"
                rightIcon={
                  <StSvg
                    name="Done_round"
                    size={24}
                    color={colors.neutral[0]}
                  />
                }
                onPress={handleSubmitCode}
                loading={isSubmittingCode}
                disabled={isSubmittingCode || code.length !== CODE_LENGTH}
                variant="accent"
              />
            </View>
          </StModal>
        </>
      )}
    </ScreenWithToolbar>
  );
};

export default TelegramDirectAuth;
