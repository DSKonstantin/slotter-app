import React, { useCallback } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { skipToken } from "@reduxjs/toolkit/query";

import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useRefresh } from "@/src/hooks/useRefresh";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useTodaySchedule } from "@/src/hooks/useTodaySchedule";
import { useGetUpcomingAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { useGetNotificationsQuery } from "@/src/store/redux/services/api/notificationsApi";

import HomeHeader from "@/src/components/app/root/homeHeader";
import HomeOverview from "@/src/components/app/root/homeOverview";
import InsightsCarousel from "@/src/components/app/root/insightsCarousel";
import NotificationBanners from "@/src/components/app/root/notificationBanners";

const Home = () => {
  const { bottom } = useSafeAreaInsets();
  const auth = useRequiredAuth();

  const { refetch: refetchSchedule } = useTodaySchedule();

  const { refetch: refetchAppointments } = useGetUpcomingAppointmentsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const { refetch: refetchNotifications } = useGetNotificationsQuery({
    per_count: 50,
  });

  const refetchAll = useCallback(
    () =>
      Promise.all([
        refetchSchedule(),
        refetchAppointments(),
        refetchNotifications(),
      ]),
    [refetchSchedule, refetchAppointments, refetchNotifications],
  );

  const { refreshing, onRefresh } = useRefresh(refetchAll);

  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
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
      </ScrollView>
      <View
        className="px-screen gap-3"
        style={{ paddingBottom: TAB_BAR_HEIGHT + bottom + 8 }}
      >
        <NotificationBanners />
        {/*// TODO: нижние уведомления */}
        {/*<InsightsCarousel />*/}
      </View>
    </SafeAreaView>
  );
};

export default Home;
