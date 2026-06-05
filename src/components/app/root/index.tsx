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
import { useGetUpcomingAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { useLazyGetMeQuery } from "@/src/store/redux/services/api/authApi";
import { useGetNotificationsQuery } from "@/src/store/redux/services/api/notificationsApi";

import HomeHeader from "@/src/components/app/root/homeHeader";
import HomeOverview from "@/src/components/app/root/homeOverview";
import InsightsCarousel from "@/src/components/app/root/insightsCarousel";
import NotificationBanners from "@/src/components/app/root/notificationBanners";

const Home = () => {
  const auth = useRequiredAuth();

  const { refetch: refetchAppointments } = useGetUpcomingAppointmentsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const { refetch: refetchNotifications } = useGetNotificationsQuery({
    per_count: 50,
    is_read: false,
  });

  const [triggerGetMe] = useLazyGetMeQuery();

  const { refetch: refetchSchedule } = useTodaySchedule();

  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  const refetchAll = useCallback(
    () =>
      Promise.all([
        refetchSchedule(),
        refetchAppointments(),
        refetchNotifications(),
        triggerGetMe(),
      ]),
    [refetchSchedule, refetchAppointments, refetchNotifications, triggerGetMe],
  );

  const { refreshing, onRefresh } = useRefresh(refetchAll);

  useFocusEffect(
    useCallback(() => {
      if (auth) {
        refetchSchedule();
        refetchAppointments();
        refetchNotifications();
      }
    }, [auth, refetchSchedule, refetchAppointments, refetchNotifications]),
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
