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

  const { refetch: refetchNotifications } = useGetNotificationsQuery({
    per_count: 50,
    is_read: false,
  });

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
      ]),
    [
      refetchSchedule,
      refetchAppointments,
      refetchUpcoming,
      refetchNotifications,
    ],
  );

  const { refreshing, onRefresh } = useRefresh(refetchAll);

  useFocusEffect(
    useCallback(() => {
      if (auth) {
        refetchSchedule();
        refetchAppointments();
        refetchUpcoming();
        refetchNotifications();
      }
    }, [
      auth,
      refetchSchedule,
      refetchAppointments,
      refetchUpcoming,
      refetchNotifications,
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
        <View className="px-screen gap-3 mt-5">
          <NotificationBanners />
          <InsightsCarousel />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
