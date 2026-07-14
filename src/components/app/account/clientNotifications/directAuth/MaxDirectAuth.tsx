import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "@backpackapp-io/react-native-toast";
import { useDispatch } from "react-redux";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, FloatingFooter, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { api } from "@/src/store/redux/services/api";
import {
  useStartDirectChannelAuthMutation,
  useGetDirectChannelAuthStatusQuery,
} from "@/src/store/redux/services/api/subscriptionDirectApi";
import type { SubscriptionDirectChannel } from "@/src/store/redux/services/api-types";
import ConnectedStep from "./ConnectedStep";

const KIND = "max_direct" as const;

type Step = "connecting" | "connected";

const MaxDirectAuth = () => {
  const [step, setStep] = useState<Step>("connecting");
  const [qr, setQr] = useState<string | null>(null);
  const [connectedChannel, setConnectedChannel] =
    useState<SubscriptionDirectChannel | null>(null);

  const auth = useRequiredAuth();
  const dispatch = useDispatch();

  const [startAuth, { isLoading: isRefreshingQr }] =
    useStartDirectChannelAuthMutation();

  const { data: statusData } = useGetDirectChannelAuthStatusQuery(
    auth && step === "connecting"
      ? { userId: auth.userId, kind: KIND }
      : skipToken,
    { pollingInterval: step === "connecting" ? 2000 : 0 },
  );

  const startMaxAuth = useCallback(async () => {
    if (!auth) return;
    try {
      const result = await startAuth({
        userId: auth.userId,
        kind: KIND,
      }).unwrap();
      if (result.qr) setQr(result.qr);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось получить QR-код"));
    }
  }, [auth, startAuth]);

  const handleDone = useCallback(() => {
    router.dismissTo(Routers.app.account.clientNotifications.root);
  }, []);

  useEffect(() => {
    startMaxAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (statusData?.auth_status === "connected") {
      setConnectedChannel(statusData.subscription_direct_channel);
      setStep("connected");
      dispatch(api.util.invalidateTags(["SubscriptionDirectChannels"]));
    }
  }, [statusData, dispatch]);

  const footer =
    step === "connected" ? (
      <Button title="Готово" onPress={handleDone} variant="accent" />
    ) : null;

  return (
    <ScreenWithToolbar title="Подключение рассылки">
      {({ topInset, bottomInset }) => (
        <>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: topInset,
              paddingBottom: bottomInset + 80,
            }}
            className="px-screen"
            showsVerticalScrollIndicator={false}
          >
            {step === "connecting" && (
              <View className="flex-1 items-center justify-center gap-4">
                {qr ? (
                  <Image
                    source={{ uri: qr }}
                    style={{ width: 220, height: 220 }}
                  />
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
                  Отсканируйте QR в приложении Макс
                </Typography>
                <Typography className="text-body text-neutral-500 text-center">
                  Макс → Настройки → Устройства → Войти по QR-коду
                </Typography>
                <Button
                  title="Код устарел? Обновить"
                  onPress={startMaxAuth}
                  loading={isRefreshingQr}
                  disabled={isRefreshingQr}
                  variant="clear"
                  size="sm"
                />
              </View>
            )}

            {step === "connected" && (
              <ConnectedStep channel={connectedChannel} />
            )}
          </ScrollView>

          {footer && (
            <FloatingFooter offset={bottomInset + 8}>{footer}</FloatingFooter>
          )}
        </>
      )}
    </ScreenWithToolbar>
  );
};

export default MaxDirectAuth;
