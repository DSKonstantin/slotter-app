import { useCallback, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { eachDayOfInterval, endOfMonth } from "date-fns";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { parseTime } from "@/src/utils/date/formatTime";
import type {
  Appointment,
  WorkingDay,
} from "@/src/store/redux/services/api-types";

type Params = {
  auth: { userId: number } | null;
  fetchMonth: Date;
  currentMonth: Date;
};

const useMonthCalendarData = ({ auth, fetchMonth, currentMonth }: Params) => {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: workingDaysData,
    isLoading: isWorkingDaysLoading,
    isError: isWorkingDaysError,
    refetch: refetchWorkingDays,
  } = useGetWorkingDaysQuery(
    auth
      ? {
          userId: auth.userId,
          date_from: formatApiDate(fetchMonth),
          date_to: formatApiDate(endOfMonth(fetchMonth)),
        }
      : skipToken,
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
            date_from: formatApiDate(fetchMonth),
            date_to: formatApiDate(endOfMonth(fetchMonth)),
            status: ["pending", "confirmed"],
          },
        }
      : skipToken,
  );

  const isLoading = isWorkingDaysLoading || isAppointmentsLoading;
  const isError = isWorkingDaysError || isAppointmentsError;

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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchWorkingDays(), refetchAppointments()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchWorkingDays, refetchAppointments]);

  return {
    calendarData,
    isLoading,
    isError,
    hasData: !!workingDaysData || !!appointmentsData,
    refreshing,
    handleRefresh,
  };
};

export default useMonthCalendarData;
