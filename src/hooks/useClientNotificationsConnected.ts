import { useCallback } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useFocusEffect } from "expo-router";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useRefetchOnForeground } from "@/src/hooks/useRefetchOnForeground";
import { useAppSelector } from "@/src/store/redux/store";
import { useGetSubscriptionDirectChannelsQuery } from "@/src/store/redux/services/api/subscriptionDirectApi";
import { isDirectChannelActive } from "@/src/utils/directChannel";
import { asArray } from "@/src/utils/asArray";
import { safeRefetch } from "@/src/utils/safeRefetch";

type ClientNotificationsConnected = {
  connected: boolean;
  isLoading: boolean;
  channels: { telegram: boolean; max: boolean };
};

const NO_CHANNELS = { telegram: false, max: false };

export function useClientNotificationsConnected(): ClientNotificationsConnected {
  const ispe = useAppSelector((state) => state.appVersion.ispe);
  const auth = useRequiredAuth();

  const canQuery = auth != null && ispe;

  const { data, isLoading, refetch } = useGetSubscriptionDirectChannelsQuery(
    canQuery ? { userId: auth.userId } : skipToken,
    { refetchOnMountOrArgChange: true },
  );

  useFocusEffect(
    useCallback(() => {
      if (canQuery) safeRefetch(refetch);
    }, [canQuery, refetch]),
  );

  useRefetchOnForeground(() => {
    if (canQuery) safeRefetch(refetch);
  });

  if (!ispe)
    return { connected: false, isLoading: false, channels: NO_CHANNELS };

  const active = asArray(data?.subscription_direct_channels).filter(
    isDirectChannelActive,
  );
  const channels = {
    telegram: active.some((c) => c.kind === "telegram_direct"),
    max: active.some((c) => c.kind === "max_direct"),
  };

  return {
    connected: channels.telegram || channels.max,
    isLoading,
    channels,
  };
}
