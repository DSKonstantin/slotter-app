import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { unMask } from "react-native-mask-text";
import { toast } from "@backpackapp-io/react-native-toast";
import { useDispatch } from "react-redux";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, Input, StSvg, Typography } from "@/src/components/ui";
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
import type { DirectChannelKind } from "@/src/store/redux/services/api-types";

type Channel = "telegram" | "max";

const KIND_MAP: Record<Channel, DirectChannelKind> = {
  telegram: "telegram_direct",
  max: "max_direct",
};

type Step = "phone" | "code" | "password" | "connecting" | "connected";

const DirectAuthScreen = () => {
  const { channel } = useLocalSearchParams<{ channel: Channel }>();
  const kind = KIND_MAP[channel ?? "telegram"];
  const isMax = kind === "max_direct";

  const [step, setStep] = useState<Step>(isMax ? "connecting" : "phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  const auth = useRequiredAuth();
  const dispatch = useDispatch();

  const [startAuth, { isLoading: isStartingAuth }] =
    useStartDirectChannelAuthMutation();
  const [submitCode, { isLoading: isSubmittingCode }] =
    useSubmitDirectChannelAuthCodeMutation();
  const [submitPassword, { isLoading: isSubmittingPassword }] =
    useSubmitDirectChannelAuthPasswordMutation();

  const { data: statusData } = useGetDirectChannelAuthStatusQuery(
    auth && step === "connecting" ? { userId: auth.userId, kind } : skipToken,
    { pollingInterval: step === "connecting" ? 2000 : 0 },
  );

  const startMaxAuth = useCallback(async () => {
    if (!auth) return;
    try {
      const result = await startAuth({ userId: auth.userId, kind }).unwrap();
      if (result.qr) setQr(result.qr);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось получить QR-код"));
    }
  }, [auth, startAuth, kind]);

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
        kind,
        phone: `+${unMask(phone)}`,
      }).unwrap();
      setStep("code");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
    }
  }, [auth, startAuth, kind, phone]);

  const handleResendCode = useCallback(async () => {
    if (!auth) return;
    try {
      await startAuth({
        userId: auth.userId,
        kind,
        phone: `+${unMask(phone)}`,
      }).unwrap();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
    }
  }, [auth, startAuth, kind, phone]);

  const handleCodeComplete = useCallback(
    async (value: string) => {
      if (!auth) return;
      try {
        const result = await submitCode({
          userId: auth.userId,
          kind,
          code: value,
        }).unwrap();
        setStep(result.needs_password ? "password" : "connecting");
      } catch (e) {
        toast.error(getApiErrorMessage(e, "Неверный код"));
      }
    },
    [auth, submitCode, kind],
  );

  const handleSendPassword = useCallback(async () => {
    if (!auth || !password) return;
    try {
      await submitPassword({ userId: auth.userId, kind, password }).unwrap();
      setStep("connecting");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Неверный пароль"));
    }
  }, [auth, submitPassword, kind, password]);

  const handleDone = useCallback(() => {
    router.dismissTo(Routers.app.account.clientNotifications.root);
  }, []);

  useEffect(() => {
    if (isMax) startMaxAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMax]);

  useEffect(() => {
    if (statusData?.auth_status === "connected") {
      setStep("connected");
      dispatch(api.util.invalidateTags(["SubscriptionDirectChannels"]));
    }
  }, [statusData, dispatch]);

  return (
    <ScreenWithToolbar title="Привязка канала">
      {({ topInset, bottomInset }) => (
        <View
          style={{ paddingTop: topInset, paddingBottom: bottomInset + 8 }}
          className="flex-1 px-screen"
        >
          {step === "phone" && (
            <View className="mt-8 flex-1">
              <Typography weight="semibold" className="text-display mb-2">
                Номер телефона
              </Typography>
              <Typography className="text-body text-neutral-500 mb-6">
                Введите номер, привязанный к вашему аккаунту Telegram
              </Typography>
              <Input
                value={phone}
                onChangeText={(t) => setPhone(maskPhone(t))}
                label="Телефон"
                placeholder="+7 999 999-99-99"
                keyboardType="phone-pad"
                error={
                  phoneError
                    ? { type: "manual", message: phoneError }
                    : undefined
                }
              />
              <View className="mt-6">
                <Button
                  title="Получить код"
                  onPress={handleSendPhone}
                  loading={isStartingAuth}
                  disabled={isStartingAuth}
                  variant="accent"
                />
              </View>
            </View>
          )}

          {step === "code" && (
            <View className="mt-8 flex-1">
              <Typography weight="semibold" className="text-display mb-2">
                Введите код
              </Typography>
              <Typography className="text-body text-neutral-500 mb-6">
                Код отправлен в Telegram на номер {phone}
              </Typography>
              <OtpConfirm
                length={5}
                onChange={() => {}}
                onComplete={handleCodeComplete}
                onResend={handleResendCode}
                disabled={isSubmittingCode}
              />
            </View>
          )}

          {step === "password" && (
            <View className="mt-8 flex-1">
              <Typography weight="semibold" className="text-display mb-2">
                Пароль (2FA)
              </Typography>
              <Typography className="text-body text-neutral-500 mb-6">
                В вашем аккаунте Telegram включена двухфакторная аутентификация
                — введите облачный пароль
              </Typography>
              <Input
                value={password}
                onChangeText={setPassword}
                label="Пароль"
                secureTextEntry={!showPassword}
                endAdornment={
                  <EyeToggle
                    visible={showPassword}
                    onPress={() => setShowPassword((v) => !v)}
                  />
                }
              />
              <View className="mt-6">
                <Button
                  title="Подтвердить"
                  onPress={handleSendPassword}
                  loading={isSubmittingPassword}
                  disabled={isSubmittingPassword || !password}
                  variant="accent"
                />
              </View>
            </View>
          )}

          {step === "connecting" && (
            <View className="flex-1 items-center justify-center gap-4">
              {isMax ? (
                qr ? (
                  <Image
                    source={{ uri: qr }}
                    style={{ width: 220, height: 220 }}
                  />
                ) : (
                  <ActivityIndicator
                    size="large"
                    color={colors.primary.blue[500]}
                  />
                )
              ) : (
                <ActivityIndicator
                  size="large"
                  color={colors.primary.blue[500]}
                />
              )}
              <Typography
                weight="semibold"
                className="text-display text-center"
              >
                {isMax
                  ? "Отсканируйте QR в приложении Макс"
                  : "Привязываем аккаунт…"}
              </Typography>
              <Typography className="text-body text-neutral-500 text-center">
                {isMax
                  ? "Макс → Настройки → Устройства → Сканировать QR"
                  : "Это займёт несколько секунд"}
              </Typography>
            </View>
          )}

          {step === "connected" && (
            <View className="flex-1 items-center justify-center gap-4">
              <StSvg
                name="Check_round_fill"
                size={60}
                color={colors.primary.blue[500]}
              />
              <Typography
                weight="semibold"
                className="text-display text-center"
              >
                Канал подключён
              </Typography>
              <Typography className="text-body text-neutral-500 text-center">
                Уведомления клиентам теперь идут от вашего имени
              </Typography>
              <Button title="Готово" onPress={handleDone} variant="accent" />
            </View>
          )}
        </View>
      )}
    </ScreenWithToolbar>
  );
};

export default DirectAuthScreen;
