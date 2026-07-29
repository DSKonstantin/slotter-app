import React, { useCallback } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { skipToken } from "@reduxjs/toolkit/query";
import { useFocusEffect } from "expo-router";

import { useAppSelector } from "@/src/store/redux/store";
import { useTabBarHeight } from "@/src/hooks/useTabBarHeight";
import { useRefresh } from "@/src/hooks/useRefresh";
import { useRefetchOnForeground } from "@/src/hooks/useRefetchOnForeground";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useSubscriptionQuota } from "@/src/hooks/useSubscriptionQuota";
import { useTodaySchedule } from "@/src/hooks/useTodaySchedule";
import {
  useGetAppointmentsQuery,
  useGetUpcomingAppointmentsQuery,
} from "@/src/store/redux/services/api/appointmentsApi";
import { useLazyGetSubscriptionMembershipQuery } from "@/src/store/redux/services/api/subscriptionApi";
import { useGetNotificationsQuery } from "@/src/store/redux/services/api/notificationsApi";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { safeRefetch } from "@/src/utils/safeRefetch";

import HomeHeader from "@/src/components/app/root/homeHeader";
import HomeOverview from "@/src/components/app/root/homeOverview";
import InsightsCarousel from "@/src/components/app/root/insightsCarousel";
import NotificationBanners from "@/src/components/app/root/notificationBanners";

const Home = () => {
  const auth = useRequiredAuth();
  const ispe = useAppSelector((s) => s.appVersion.ispe);
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

  const { shouldFetchQuota, refetch: refetchQuota } = useSubscriptionQuota();

  const { refetch: refetchSchedule } = useTodaySchedule();

  const { refetch: refetchUpcoming } = useGetUpcomingAppointmentsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  const [getSubscriptionMembership] = useLazyGetSubscriptionMembershipQuery();
  const refetchMembership = useCallback(() => {
    if (!auth || !ispe) return Promise.resolve();
    return getSubscriptionMembership({ userId: auth.userId });
  }, [auth, ispe, getSubscriptionMembership]);
  useRefetchOnForeground(refetchMembership);

  const refetchAll = useCallback(() => {
    const tryRefetch = (refetch: () => unknown) => {
      try {
        return Promise.resolve(refetch());
      } catch {
        return Promise.resolve();
      }
    };

    return Promise.all([
      tryRefetch(refetchSchedule),
      tryRefetch(refetchAppointments),
      tryRefetch(refetchUpcoming),
      tryRefetch(refetchNotifications),
      shouldFetchQuota ? tryRefetch(refetchQuota) : Promise.resolve(),
      refetchMembership(),
    ]);
  }, [
    refetchSchedule,
    refetchAppointments,
    refetchUpcoming,
    refetchNotifications,
    refetchQuota,
    shouldFetchQuota,
    refetchMembership,
  ]);

  const { refreshing, onRefresh } = useRefresh(refetchAll);

  useFocusEffect(
    useCallback(() => {
      if (!auth) return;
      safeRefetch(refetchSchedule);
      safeRefetch(refetchAppointments);
      safeRefetch(refetchUpcoming);
      safeRefetch(refetchNotifications);
      if (shouldFetchQuota) safeRefetch(refetchQuota);
    }, [
      auth,
      shouldFetchQuota,
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
          paddingBottom: 8,
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
        </View>
      </ScrollView>
      <View style={{ paddingBottom: tabBarHeight + bottom + 8 }}>
        <InsightsCarousel />
      </View>
    </SafeAreaView>
  );
};

export default Home;
