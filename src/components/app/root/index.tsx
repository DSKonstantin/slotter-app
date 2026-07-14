import React, { useCallback } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { skipToken } from "@reduxjs/toolkit/query";
import { useFocusEffect } from "expo-router";

import { useTabBarHeight } from "@/src/hooks/useTabBarHeight";
import { useRefresh } from "@/src/hooks/useRefresh";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useTodaySchedule } from "@/src/hooks/useTodaySchedule";
import {
  useGetAppointmentsQuery,
  useGetUpcomingAppointmentsQuery,
} from "@/src/store/redux/services/api/appointmentsApi";
import { useGetNotificationsQuery } from "@/src/store/redux/services/api/notificationsApi";
import { useGetSubscriptionQuotaQuery } from "@/src/store/redux/services/api/subscriptionApi";
import { useAppSelector } from "@/src/store/redux/store";
import { formatApiDate } from "@/src/utils/date/formatDate";

import HomeHeader from "@/src/components/app/root/homeHeader";
import HomeOverview from "@/src/components/app/root/homeOverview";
import InsightsCarousel from "@/src/components/app/root/insightsCarousel";
import NotificationBanners from "@/src/components/app/root/notificationBanners";

const Home = () => {
  const auth = useRequiredAuth();
  const today = formatApiDate(new Date());

  const { refetch: refetchAppointments } = useGetAppointmentsQuery(
    auth
      ? {
          userId: auth.userId,
          params: {
            date_from: today,
            date_to: today,
            status: ["pending", "confirmed", "arrived"],
          },
        }
      : skipToken,
  );

  const { refetch: refetchNotifications } = useGetNotificationsQuery(
    auth ? { per_count: 50, is_read: false } : skipToken,
  );

  const membership = useAppSelector(
    (s) => s.auth.user?.subscription_membership,
  );

  const { refetch: refetchQuota } = useGetSubscriptionQuotaQuery(
    auth && membership?.plan !== "pro" ? { userId: auth.userId } : skipToken,
  );

  const { refetch: refetchSchedule } = useTodaySchedule();

  const { refetch: refetchUpcoming } = useGetUpcomingAppointmentsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  const refetchAll = useCallback(
    () =>
      Promise.all([
        refetchSchedule(),
        refetchAppointments(),
        refetchUpcoming(),
        refetchNotifications(),
        refetchQuota(),
      ]),
    [
      refetchSchedule,
      refetchAppointments,
      refetchUpcoming,
      refetchNotifications,
      refetchQuota,
    ],
  );

  const { refreshing, onRefresh } = useRefresh(refetchAll);

  useFocusEffect(
    useCallback(() => {
      if (!auth) return;
      // Query hooks may not have started their subscription yet on the
      // very first focus event (e.g. right after mount) — refetch() throws
      // in that case. The hooks already fetch on mount on their own, so
      // it's safe to just skip a refetch that isn't ready yet.
      const safeRefetch = (refetch: () => unknown) => {
        try {
          refetch();
        } catch {
          // ignore — see comment above
        }
      };
      safeRefetch(refetchSchedule);
      safeRefetch(refetchAppointments);
      safeRefetch(refetchUpcoming);
      safeRefetch(refetchNotifications);
      // quota query is skipToken'd for pro plans — it never starts, so
      // don't bother refetching it there
      if (membership?.plan !== "pro") safeRefetch(refetchQuota);
    }, [
      auth,
      membership?.plan,
      refetchSchedule,
      refetchAppointments,
      refetchUpcoming,
      refetchNotifications,
      refetchQuota,
    ]),
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <HomeHeader />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: tabBarHeight + bottom + 8,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-screen flex-1 gap-3">
          <HomeOverview />
        </View>
        <View className="gap-3 mt-5">
          <NotificationBanners />
          <InsightsCarousel />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
