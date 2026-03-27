import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { RefreshControl, ScrollView } from "react-native";

import TimeSlotList from "@/src/components/app/calendar/home/day/timeSlotList";
import CalendarActionButton from "@/src/components/app/calendar/home/сalendarActionButton";
import CalendarError from "@/src/components/app/calendar/home/day/CalendarError";
import TimeSlotListSkeleton from "@/src/components/app/calendar/home/day/timeSlotList/TimeSlotListSkeleton";

import { useAppSelector } from "@/src/store/redux/store";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import type { Appointment } from "@/src/store/redux/services/api-types";
import EmptySlots from "@/src/components/app/calendar/home/day/timeSlotList/EmptySlots";
import DateSelector from "@/src/components/app/calendar/home/day/dateSelector";

const DayCalendarView = () => {
  const router = useRouter();
  const auth = useRequiredAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await refetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [refetchAll]);

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

  const content = useMemo(() => {
    if (hasError)
      return (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <CalendarError isLoading={isRetrying} onRetry={handleRetry} />
        </ScrollView>
      );
    if (isLoading) return <TimeSlotListSkeleton />;
    if (isEmpty)
      return (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <EmptySlots onPress={handleEmptyPress} />
        </ScrollView>
      );
    return (
      <TimeSlotList
        appointment={appointments}
        breaks={selectedWorkingDay?.working_day_breaks}
        startAt={selectedWorkingDay?.start_at}
        endAt={selectedWorkingDay?.end_at}
        date={selectedDay}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    );
  }, [
    hasError,
    isLoading,
    isEmpty,
    refreshing,
    handleRefresh,
    isRetrying,
    handleRetry,
    handleEmptyPress,
    appointments,
    selectedWorkingDay,
    selectedDay,
  ]);

  if (!auth) return null;

  return (
    <>
      <DateSelector
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        workingDaysData={workingDaysData ?? undefined}
        isLoading={isDayLoading}
      />
      {content}
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
