import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TimeSlotList from "@/src/components/app/calendar/home/day/timeSlotList";
import CalendarActionButton from "@/src/components/app/calendar/home/сalendarActionButton";
import ErrorScreen from "@/src/components/shared/errorScreen";
import TimeSlotListSkeleton from "@/src/components/app/calendar/home/day/timeSlotList/TimeSlotListSkeleton";

import { useAppSelector } from "@/src/store/redux/store";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import type { Appointment } from "@/src/store/redux/services/api-types";
import EmptyStateScreen from "@/src/components/shared/emptyStateScreen";
import DateSelector from "@/src/components/app/calendar/home/day/dateSelector";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useRefresh } from "@/src/hooks/useRefresh";

const DayCalendarView = () => {
  const router = useRouter();
  const auth = useRequiredAuth();
  const { bottom } = useSafeAreaInsets();
  const [isRetrying, setIsRetrying] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const pendingScrollY = useRef<number | null>(null);
  const dateSelectorHeightRef = useRef(0);

  const selectedDay = useAppSelector((state) => state.calendar.selectedDay);
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
      router.push(Routers.app.calendar.daySchedule(selectedWorkingDay.id));
    } else {
      router.push(Routers.app.calendar.dayScheduleCreate(selectedDay));
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
    () => !isLoading && !selectedWorkingDay,
    [isLoading, selectedWorkingDay],
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
    router.push(Routers.app.calendar.dayScheduleCreate(selectedDay));
  }, [router, selectedDay]);

  const handleHighlightScroll = useCallback((y: number) => {
    pendingScrollY.current = y + dateSelectorHeightRef.current;
  }, []);

  const content = useMemo(() => {
    if (hasError)
      return (
        <View className="flex-1">
          <ErrorScreen
            title="Не удалось загрузить календарь"
            isLoading={isRetrying}
            onRetry={handleRetry}
          />
        </View>
      );
    if (isLoading) return <TimeSlotListSkeleton />;
    if (isEmpty)
      return (
        <View className="flex-1">
          <EmptyStateScreen
            image={require("@/assets/images/placeholders/empty-slots.png")}
            title="На этот день записей нет"
            subtitle="Добавьте первую запись или настройте рабочее время"
            buttonTitle="Добавить запись"
            buttonIcon="Add_round_fill"
            onPress={handleEmptyPress}
          />
        </View>
      );
    return (
      <TimeSlotList
        appointments={appointments}
        breaks={selectedWorkingDay?.working_day_breaks}
        startAt={selectedWorkingDay?.start_at}
        endAt={selectedWorkingDay?.end_at}
        date={selectedDay}
        onHighlightScroll={handleHighlightScroll}
      />
    );
  }, [
    hasError,
    isLoading,
    isEmpty,
    isRetrying,
    handleRetry,
    handleEmptyPress,
    appointments,
    selectedWorkingDay,
    selectedDay,
    handleHighlightScroll,
  ]);

  if (!auth) return null;

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: isEmpty ? 0 : TAB_BAR_HEIGHT + bottom + 80,
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
        <View
          onLayout={(e) => {
            dateSelectorHeightRef.current = e.nativeEvent.layout.height;
          }}
        >
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            workingDaysData={workingDaysData ?? undefined}
            isLoading={isDayLoading}
          />
        </View>
        {content}
      </ScrollView>
      {!hasError && !isLoading && !isEmpty && (
        <CalendarActionButton
          onPress={handlePress}
          title={selectedWorkingDay ? "Изменить день" : "Настроить день"}
        />
      )}
    </>
  );
};

export default DayCalendarView;
