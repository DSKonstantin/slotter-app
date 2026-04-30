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

import HomeHeader from "@/src/components/app/root/homeHeader";
import HomeOverview from "@/src/components/app/root/homeOverview";

const Home = () => {
  const { bottom } = useSafeAreaInsets();
  const auth = useRequiredAuth();

  const { refetch: refetchSchedule } = useTodaySchedule();

  const { refetch: refetchAppointments } = useGetUpcomingAppointmentsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const refetchAll = useCallback(
    () => Promise.all([refetchSchedule(), refetchAppointments()]),
    [refetchSchedule, refetchAppointments],
  );

  const { refreshing, onRefresh } = useRefresh(refetchAll);

  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
      <HomeHeader />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: TAB_BAR_HEIGHT + bottom + 16,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-screen gap-3 mt-2">
          <HomeOverview />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
