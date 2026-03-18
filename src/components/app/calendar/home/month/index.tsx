import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import MonthCalendar from "@/src/components/app/calendar/home/month/MonthCalendar";
import CalendarActionButton from "@/src/components/app/calendar/home/сalendarActionButton";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  eachDayOfInterval,
  endOfMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { formatApiDate, formatMonthName } from "@/src/utils/date/formatDate";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { useAppSelector } from "@/src/store/redux/store";
import { useRouter } from "expo-router";
import type {
  Appointment,
  WorkingDay,
} from "@/src/store/redux/services/api-types";
import { parseTime } from "@/src/utils/date/formatTime";
import ScheduleActionsModal from "./ScheduleActionsModal";

const MonthCalendarView = () => {
  const { bottom } = useSafeAreaInsets();
  const auth = useRequiredAuth();
  const routerInstance = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const selectedDay = useAppSelector((state) => state.calendar.selectedDay);
  const selectedDate = useMemo(() => parseISO(selectedDay), [selectedDay]);
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(parseISO(selectedDay)),
  );
  const [pendingMonth, setPendingMonth] = useState<Date | null>(null);

  const fetchMonth = pendingMonth ?? currentMonth;

  const { data: workingDaysData, isLoading: isWorkingDaysLoading } =
    useGetWorkingDaysQuery(
      auth
        ? {
            userId: auth.userId,
            date_from: formatApiDate(fetchMonth),
            date_to: formatApiDate(endOfMonth(fetchMonth)),
          }
        : skipToken,
    );

  const { data: appointmentsData, isLoading: isAppointmentsLoading } =
    useGetAppointmentsQuery(
      auth
        ? {
            userId: auth.userId,
            params: {
              date_from: formatApiDate(fetchMonth),
              date_to: formatApiDate(endOfMonth(fetchMonth)),
              status: ["pending", "confirmed"],
            },
          }
        : skipToken,
    );

  const isLoading = isWorkingDaysLoading || isAppointmentsLoading;

  const calendarData = useMemo(() => {
    const appointmentsByDate =
      (appointmentsData as Record<string, Appointment[]> | undefined) ?? {};

    const nonWorkingDays: Set<string> =
      isWorkingDaysLoading || !workingDaysData
        ? new Set()
        : new Set(
            eachDayOfInterval({
              start: currentMonth,
              end: endOfMonth(currentMonth),
            })
              .map((d) => formatApiDate(d))
              .filter((date) => !workingDaysData[date]),
          );

    const progressMap: Record<string, number> = {};
    if (workingDaysData) {
      for (const [date, workingDay] of Object.entries(workingDaysData)) {
        if (!workingDay) continue;

        const dayAppointments = appointmentsByDate[date] ?? [];
        if (dayAppointments.length === 0) continue;

        const wd = workingDay as WorkingDay;
        const availableMinutes =
          parseTime(wd.end_at) -
          parseTime(wd.start_at) -
          (wd.working_day_breaks ?? []).reduce(
            (sum, b) => sum + parseTime(b.end_at) - parseTime(b.start_at),
            0,
          );

        if (availableMinutes <= 0) continue;

        const bookedMinutes = dayAppointments.reduce(
          (sum, a) => sum + a.duration,
          0,
        );
        progressMap[date] = Math.min(1, bookedMinutes / availableMinutes);
      }
    }

    const totalAppointments = Object.values(appointmentsByDate).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );

    return { nonWorkingDays, progressMap, totalAppointments };
  }, [workingDaysData, appointmentsData, currentMonth, isWorkingDaysLoading]);

  const handleSelectDate = useCallback(
    (date: Date) => {
      routerInstance.setParams({
        mode: "day",
        date: formatApiDate(date),
      });
    },
    [routerInstance],
  );

  const handleMonthChange = useCallback((date: Date) => {
    setPendingMonth(startOfMonth(date));
  }, []);

  const prevMonthName = useMemo(
    () => formatMonthName(subMonths(currentMonth, 1)),
    [currentMonth],
  );

  useEffect(() => {
    if (!isLoading && pendingMonth) {
      setCurrentMonth(pendingMonth);
      setPendingMonth(null);
    }
  }, [isLoading, pendingMonth]);

  if (!auth) return null;

  return (
    <>
      <ScrollView
        className="px-screen"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + bottom + 80,
        }}
      >
        <MonthCalendar
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          data={{ ...calendarData, isLoading }}
        />
      </ScrollView>

      <CalendarActionButton mode="month" onPress={() => setIsOpen(true)} />

      <ScheduleActionsModal
        visible={isOpen}
        currentMonth={currentMonth}
        prevMonthName={prevMonthName}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default MonthCalendarView;
