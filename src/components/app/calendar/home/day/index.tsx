import React, { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";

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
    isFetching: isAppointmentsFetching,
    isError: isAppointmentsError,
    refetch: refetchAppointments,
  } = useGetAppointmentsQuery(
    auth ? { userId: auth.userId, params: { date: selectedDay } } : skipToken,
  );

  const selectedWorkingDay = workingDaysData?.[selectedDay] ?? undefined;
  const appointments = (appointmentsData as Appointment[] | undefined) ?? [];

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

  if (!auth) return null;

  const hasError = isDayError || isAppointmentsError;
  const isLoading =
    isDayLoading || isAppointmentsLoading || isAppointmentsFetching;
  const isEmpty = !isLoading && !selectedWorkingDay;

  const content = hasError ? (
    <CalendarError
      onRetry={async () => {
        await Promise.all([refetchWorkingDays(), refetchAppointments()]);
      }}
    />
  ) : isLoading ? (
    <TimeSlotListSkeleton />
  ) : isEmpty ? (
    <EmptySlots
      onPress={async () => {
        router.push(Routers.app.calendar.dayScheduleCreate(selectedDay));
      }}
    />
  ) : (
    <TimeSlotList
      appointment={appointments}
      breaks={selectedWorkingDay?.working_day_breaks}
      startAt={selectedWorkingDay?.start_at}
      endAt={selectedWorkingDay?.end_at}
      date={selectedDay}
    />
  );

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
