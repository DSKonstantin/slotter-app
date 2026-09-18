import React, { useCallback, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { skipToken } from "@reduxjs/toolkit/query";
import { useFocusEffect } from "expo-router";

import { useAppSelector } from "@/src/store/redux/store";
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

const onLayoutHeight =
  (setHeight: (height: number) => void) => (e: LayoutChangeEvent) =>
    setHeight(e.nativeEvent.layout.height);

import HomeHeader from "@/src/components/app/root/homeHeader";
import HomeOverview, {
  HomeOverviewHandle,
} from "@/src/components/app/root/homeOverview";
import HomeStats from "@/src/components/app/root/homeStats";
import InsightsCarousel from "@/src/components/app/root/insightsCarousel";

const Home = () => {
  const [statsHeight, setStatsHeight] = useState(0);
  const [carouselHeight, setCarouselHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const homeOverviewRef = useRef<HomeOverviewHandle>(null);
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
            status: [
              "requested",
              "pending",
              "confirmed",
              "arrived",
              "completed",
              "missed",
              "delayed",
            ],
          },
        }
      : skipToken,
  );

  const { refetch: refetchNotifications } = useGetNotificationsQuery(
    auth ? { per_count: 1, is_read: false } : skipToken,
  );

  const { shouldFetchQuota, refetch: refetchQuota } = useSubscriptionQuota();

  const { refetch: refetchSchedule } = useTodaySchedule();

  const { refetch: refetchUpcoming } = useGetUpcomingAppointmentsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

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
      homeOverviewRef.current?.expand();
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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <HomeHeader />
      <View className="flex-1" onLayout={onLayoutHeight(setContainerHeight)}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            flexGrow: 0,
            marginTop: 8,
          }}
          contentContainerStyle={{
            paddingBottom: 8,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View onLayout={onLayoutHeight(setCarouselHeight)}>
            <InsightsCarousel />
          </View>
          <View
            className="px-screen gap-3 pt-[16px] pb-[8px]"
            onLayout={onLayoutHeight(setStatsHeight)}
          >
            <HomeStats />
          </View>
        </ScrollView>

        <HomeOverview
          ref={homeOverviewRef}
          statsHeight={statsHeight}
          carouselHeight={carouselHeight}
          containerHeight={containerHeight}
        />
      </View>
    </SafeAreaView>
  );
};

export default Home;
