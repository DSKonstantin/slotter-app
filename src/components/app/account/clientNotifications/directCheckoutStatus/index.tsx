import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, FloatingFooter, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { asArray } from "@/src/utils/asArray";
import { isDirectChannelActive } from "@/src/utils/directChannel";
import { getApiErrorMessage } from "@/src/utils/apiError";
import {
  useGetSubscriptionDirectChannelsQuery,
  useCancelDirectChannelMutation,
} from "@/src/store/redux/services/api/subscriptionDirectApi";
import type { DirectChannelKind } from "@/src/store/redux/services/api-types";

type Channel = "telegram" | "max";

const KIND_MAP: Record<Channel, DirectChannelKind> = {
  telegram: "telegram_direct",
  max: "max_direct",
};

const DirectCheckoutStatusScreen = () => {
  const hasNavigatedToAuth = useRef(false);
  const [isActive, setIsActive] = useState(false);

  const { channel } = useLocalSearchParams<{ channel: Channel }>();
  const auth = useRequiredAuth();
  const { data: channelsData } = useGetSubscriptionDirectChannelsQuery(
    auth && !isActive ? { userId: auth.userId } : skipToken,
    { pollingInterval: 3000 },
  );
  const [cancelDirectChannel, { isLoading: isCancelling }] =
    useCancelDirectChannelMutation();

  const kind = KIND_MAP[channel ?? "telegram"];
  const existingChannel = asArray(
    channelsData?.subscription_direct_channels,
  ).find((c) => c.kind === kind);
  const status = existingChannel?.status;

  const screenState: "active" | "pending" | "configuring" =
    isActive || (existingChannel && isDirectChannelActive(existingChannel))
      ? "active"
      : status === "pending"
        ? "pending"
        : "configuring";

  const handleCancel = useCallback(() => {
    if (!auth) return;
    Alert.alert(
      "Отменить оплату?",
      "Канал не будет подключён. Вы сможете начать оплату заново в любой момент",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Подтвердить",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelDirectChannel({ userId: auth.userId, kind }).unwrap();
              toast.success("Оплата отменена");
              router.back();
            } catch (e) {
              toast.error(getApiErrorMessage(e, "Не удалось отменить"));
            }
          },
        },
      ],
    );
  }, [auth, cancelDirectChannel, kind]);

  const handleBackToList = useCallback(() => {
    router.dismissTo(Routers.app.account.clientNotifications.root);
  }, []);

  useEffect(() => {
    if (existingChannel && isDirectChannelActive(existingChannel)) {
      setIsActive(true);
    }
  }, [existingChannel]);

  useEffect(() => {
    if (
      !hasNavigatedToAuth.current &&
      existingChannel?.provisioning_status === "awaiting_auth"
    ) {
      hasNavigatedToAuth.current = true;
      router.replace({
        pathname: Routers.app.account.clientNotifications.directAuth,
        params: { channel },
      });
    }
  }, [existingChannel, channel]);

  const footer =
    screenState === "active" ? (
      <Button
        title="К списку каналов"
        onPress={handleBackToList}
        variant="accent"
      />
    ) : screenState === "pending" ? (
      <Button
        title="Отменить"
        onPress={handleCancel}
        loading={isCancelling}
        disabled={isCancelling}
        textClassName="text-accent-red-500"
        variant="clear"
        rightIcon={
          <StSvg
            name="Close_round_fill"
            size={24}
            color={colors.accent.red[500]}
          />
        }
      />
    ) : null;

  return (
    <ScreenWithToolbar title="Проверка оплаты">
      {({ topInset, bottomInset }) => (
        <>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingTop: topInset,
              paddingBottom: bottomInset + 80,
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
            className="px-screen"
            showsVerticalScrollIndicator={false}
          >
            {screenState === "active" && (
              <>
                <StSvg
                  name="Check_round_fill"
                  size={60}
                  color={colors.primary.blue[500]}
                />
                <Typography
                  weight="semibold"
                  className="text-display text-center"
                >
                  Канал уже активен
                </Typography>
              </>
            )}

            {screenState === "pending" && (
              <>
                <ActivityIndicator
                  size="large"
                  color={colors.primary.blue[500]}
                />
                <Typography
                  weight="semibold"
                  className="text-display text-center"
                >
                  Оплата не завершена
                </Typography>
                <Typography className="text-body text-neutral-500 text-center">
                  Платёж ещё не подтверждён. Проверяем каждые несколько секунд…
                </Typography>
              </>
            )}

            {screenState === "configuring" && (
              <>
                <ActivityIndicator
                  size="large"
                  color={colors.primary.blue[500]}
                />
                <Typography
                  weight="semibold"
                  className="text-display text-center"
                >
                  Настраиваем канал…
                </Typography>
                <Typography className="text-body text-neutral-500 text-center">
                  Это займёт несколько минут
                </Typography>
              </>
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

export default DirectCheckoutStatusScreen;
