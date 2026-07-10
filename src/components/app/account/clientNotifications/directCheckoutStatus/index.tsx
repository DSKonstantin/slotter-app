import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { asArray } from "@/src/utils/asArray";
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
  const { channel } = useLocalSearchParams<{ channel: Channel }>();
  const kind = KIND_MAP[channel ?? "telegram"];

  const auth = useRequiredAuth();

  const { data: channelsData } = useGetSubscriptionDirectChannelsQuery(
    auth ? { userId: auth.userId } : skipToken,
    { pollingInterval: 3000 },
  );

  const [cancelDirectChannel, { isLoading: isCancelling }] =
    useCancelDirectChannelMutation();

  const existingChannel = asArray(
    channelsData?.subscription_direct_channels,
  ).find((c) => c.kind === kind);

  const handleCancel = async () => {
    if (!auth) return;
    try {
      await cancelDirectChannel({ userId: auth.userId, kind }).unwrap();
      toast.success("Оплата отменена");
      router.back();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отменить"));
    }
  };

  const handleBackToList = () => {
    router.dismissTo(Routers.app.account.clientNotifications.root);
  };

  useEffect(() => {
    if (existingChannel?.provisioning_status === "awaiting_auth") {
      router.replace({
        pathname: Routers.app.account.clientNotifications.directAuth,
        params: { channel },
      });
    }
  }, [existingChannel, channel]);

  return (
    <ScreenWithToolbar title="Проверка оплаты">
      {({ topInset, bottomInset }) => (
        <View
          style={{ paddingTop: topInset, paddingBottom: bottomInset + 8 }}
          className="flex-1 px-screen items-center justify-center gap-4"
        >
          {existingChannel?.status === "active" ? (
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
              <Button
                title="К списку каналов"
                onPress={handleBackToList}
                variant="accent"
              />
            </>
          ) : existingChannel?.status === "pending" ? (
            <>
              <StSvg name="Time" size={60} color={colors.neutral[400]} />
              <Typography
                weight="semibold"
                className="text-display text-center"
              >
                Оплата не завершена
              </Typography>
              <Typography className="text-body text-neutral-500 text-center">
                Платёж ещё не подтверждён. Если оплата не прошла — попробуйте
                снова
              </Typography>
              <Button
                title="Отменить и попробовать снова"
                onPress={handleCancel}
                loading={isCancelling}
                disabled={isCancelling}
                variant="clear"
              />
            </>
          ) : (
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
                Это займёт несколько секунд
              </Typography>
            </>
          )}
        </View>
      )}
    </ScreenWithToolbar>
  );
};

export default DirectCheckoutStatusScreen;
