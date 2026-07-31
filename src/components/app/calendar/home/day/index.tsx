import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { RefreshControl, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import TimeSlotList from "@/src/components/app/calendar/home/day/timeSlotList";
import CalendarActionButton from "@/src/components/app/calendar/home/сalendarActionButton";
import TimeSlotListSkeleton from "@/src/components/app/calendar/home/day/timeSlotList/TimeSlotListSkeleton";

import { useAppSelector } from "@/src/store/redux/store";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { safeRefetch } from "@/src/utils/safeRefetch";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import type { Appointment } from "@/src/store/redux/services/api-types";
import EmptyStateScreen, {
  ErrorScreen,
} from "@/src/components/shared/emptyStateScreen";
import DateSelector from "@/src/components/app/calendar/home/day/dateSelector";
import { useRefresh } from "@/src/hooks/useRefresh";

const DayCalendarView = ({ bottomInset }: { bottomInset: number }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollViewRef =
    useRef<React.ComponentRef<typeof Animated.ScrollView>>(null);
  const pendingScrollY = useRef<number | null>(null);
  const scrollY = useSharedValue(0);
  const headerTranslateY = useSharedValue(0);
  const headerHeightShared = useSharedValue(0);
  const auth = useRequiredAuth();
  const selectedDay = useAppSelector((state) => state.calendar.selectedDay);
  const router = useRouter();
  const selectedDate = useMemo(() => parseISO(selectedDay), [selectedDay]);

  const dateRange = useMemo(
    () => ({
      date_from: format(startOfMonth(selectedDate), "yyyy-MM-dd"),
      date_to: format(endOfMonth(selectedDate), "yyyy-MM-dd"),
    }),
    [selectedDate],
  );

  const {
    data: workingDaysData,
    isLoading: isDayLoading,
    isError: isDayError,
    refetch: refetchWorkingDays,
  } = useGetWorkingDaysQuery(
    auth ? { userId: auth.userId, ...dateRange } : skipToken,
  );

  const {
    data: appointmentsData,
    isLoading: isAppointmentsLoading,
    isError: isAppointmentsError,
    refetch: refetchAppointments,
  } = useGetAppointmentsQuery(
    auth
      ? {
          userId: auth.userId,
          params: {
            date: selectedDay,
          },
        }
      : skipToken,
  );

  const selectedWorkingDay = useMemo(
    () => workingDaysData?.[selectedDay] ?? undefined,
    [workingDaysData, selectedDay],
  );

  const appointments = useMemo(
    () => (appointmentsData as Appointment[] | undefined) ?? [],
    [appointmentsData],
  );

  const handleSelectDate = useCallback(
    (date: Date) => {
      router.setParams({ date: format(date, "yyyy-MM-dd") });
    },
    [router],
  );

  const handlePress = useCallback(() => {
    if (isDayLoading) return;
    if (selectedWorkingDay) {
      router.push(Routers.app.daySchedule.edit(selectedWorkingDay.id));
    } else {
      router.push(Routers.app.daySchedule.create(selectedDay));
    }
  }, [router, isDayLoading, selectedWorkingDay, selectedDay]);

  const hasError = useMemo(
    () => isDayError || isAppointmentsError,
    [isDayError, isAppointmentsError],
  );

  const isLoading = useMemo(
    () => isDayLoading || isAppointmentsLoading,
    [isDayLoading, isAppointmentsLoading],
  );

  const isEmpty = useMemo(
    () => !isLoading && !selectedWorkingDay && appointments.length === 0,
    [isLoading, selectedWorkingDay, appointments.length],
  );

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchWorkingDays(), refetchAppointments()]);
  }, [refetchAppointments, refetchWorkingDays]);

  const { refreshing, onRefresh } = useRefresh(refetchAll);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await refetchAll();
    } finally {
      setIsRetrying(false);
    }
  }, [refetchAll]);

  const handleEmptyPress = useCallback(() => {
    router.push(Routers.app.daySchedule.create(selectedDay));
  }, [router, selectedDay]);

  const handleHighlightScroll = useCallback(
    (y: number) => {
      const total = y + headerHeight;
      pendingScrollY.current = total;
      scrollViewRef.current?.scrollTo({ y: total, animated: true });
    },
    [headerHeight],
  );

  const content = useMemo(() => {
    if (hasError)
      return (
        <ErrorScreen
          title="Не удалось загрузить календарь"
          isLoading={isRetrying}
          onRetry={handleRetry}
        />
      );
    if (isLoading) return <TimeSlotListSkeleton bottomInset={bottomInset} />;
    if (isEmpty)
      return (
        <EmptyStateScreen
          image={require("@/assets/images/app/not-working.webp")}
          title="Этот день свободен"
          subtitle="Настройте график, чтобы принимать записи в этот день"
          buttonTitle="Настроить день"
          buttonIcon="Edit_fill"
          onPress={handleEmptyPress}
        />
      );
    return (
      <TimeSlotList
        appointments={appointments}
        breaks={selectedWorkingDay?.working_day_breaks}
        workingDayId={selectedWorkingDay?.id}
        userId={auth?.userId}
        startAt={selectedWorkingDay?.start_at}
        endAt={selectedWorkingDay?.end_at}
        date={selectedDay}
        isActive={selectedWorkingDay?.is_active}
        onHighlightScroll={handleHighlightScroll}
      />
    );
  }, [
    hasError,
    isRetrying,
    handleRetry,
    isLoading,
    bottomInset,
    isEmpty,
    handleEmptyPress,
    appointments,
    selectedWorkingDay?.working_day_breaks,
    selectedWorkingDay?.id,
    selectedWorkingDay?.start_at,
    selectedWorkingDay?.end_at,
    selectedWorkingDay?.is_active,
    auth?.userId,
    selectedDay,
    handleHighlightScroll,
  ]);

  useFocusEffect(
    useCallback(() => {
      safeRefetch(refetchAppointments);
    }, [refetchAppointments]),
  );

  useEffect(() => {
    pendingScrollY.current = null;
  }, [selectedDay]);

  useEffect(() => {
    headerHeightShared.value = headerHeight;
  }, [headerHeight, headerHeightShared]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const maxScrollY = Math.max(
        event.contentSize.height - event.layoutMeasurement.height,
        0,
      );
      const y = Math.min(Math.max(event.contentOffset.y, 0), maxScrollY);
      const diff = y - scrollY.value;

      const next = headerTranslateY.value - diff;
      headerTranslateY.value = Math.min(
        0,
        Math.max(-headerHeightShared.value, next),
      );

      scrollY.value = y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.value }],
  }));

  if (!auth) return null;

  return (
    <>
      <View className="flex-1 overflow-hidden">
        <Animated.View
          className="absolute top-0 left-0 right-0 z-10 pb-4 bg-background"
          style={headerAnimatedStyle}
          onLayout={(e) => {
            setHeaderHeight(e.nativeEvent.layout.height);
          }}
        >
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            workingDaysData={workingDaysData ?? undefined}
            isLoading={isDayLoading}
          />
        </Animated.View>

        <Animated.ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: headerHeight,
            paddingBottom: isEmpty || hasError ? 0 : bottomInset + 80,
          }}
          onContentSizeChange={() => {
            if (pendingScrollY.current !== null) {
              scrollViewRef.current?.scrollTo({
                y: pendingScrollY.current,
                animated: true,
              });
              pendingScrollY.current = null;
            }
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {content}
        </Animated.ScrollView>
      </View>
      {!hasError && !isLoading && !isEmpty && (
        <CalendarActionButton
          onPress={handlePress}
          title={selectedWorkingDay ? "Изменить день" : "Настроить день"}
          bottomInset={bottomInset}
        />
      )}
    </>
  );
};

export default DayCalendarView;
