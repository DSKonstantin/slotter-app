import { useEffect, useRef } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { setProfileAttributes } from "@/src/services/appMetrica";
import { useGetSubscriptionDirectChannelsQuery } from "@/src/store/redux/services/api/subscriptionDirectApi";
import { useAppSelector } from "@/src/store/redux/store";
import { asArray } from "@/src/utils/asArray";
import { buildDirectChannelAttributes } from "@/src/utils/directChannel";

export function useAppMetricaDirectChannelsSync(enabled: boolean) {
  const lastSentRef = useRef<string | null>(null);

  const userId = useAppSelector((s) => s.auth.user?.id ?? null);
  const isSignedIn = useAppSelector(
    (s) =>
      s.auth.status === "authenticated" &&
      Boolean(s.auth.token) &&
      s.auth.user?.onboarding_step === "completed",
  );
  const ispe = useAppSelector((s) => s.appVersion.ispe);
  const { currentData } = useGetSubscriptionDirectChannelsQuery(
    enabled && isSignedIn && ispe && userId !== null ? { userId } : skipToken,
  );

  useEffect(() => {
    if (userId === null || !currentData) return;

    const attributes = buildDirectChannelAttributes(
      asArray(currentData.subscription_direct_channels),
      Date.now(),
    );
    const signature = `${userId}:${JSON.stringify(attributes)}`;
    if (signature === lastSentRef.current) return;

    lastSentRef.current = signature;
    setProfileAttributes(attributes);
  }, [userId, currentData]);
}
