import { useCallback, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { eachDayOfInterval, endOfMonth } from "date-fns";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { calculateProgressMap } from "@/src/utils/date/dayProgress";
import type { Appointment } from "@/src/store/redux/services/api-types";

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
    { refetchOnMountOrArgChange: true },
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
            status: [
              "requested",
              "pending",
              "confirmed",
              "arrived",
              "delayed",
              "missed",
              "completed",
            ],
          },
        }
      : skipToken,
    { refetchOnMountOrArgChange: true },
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
              .filter((date) => {
                const wd = workingDaysData[date];
                return !wd || !wd.is_active;
              }),
          );

    const progressMap = calculateProgressMap(
      workingDaysData,
      appointmentsByDate,
    );

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
