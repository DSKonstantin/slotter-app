import { useMemo } from "react";
import { addDays } from "date-fns";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { formatApiDate } from "@/src/utils/date/formatDate";

type TodayScheduleResult = {
  isTodayDayOff: boolean;
  hasAnySchedule: boolean;
  isReady: boolean;
  todayISO: string;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
};

export const useTodaySchedule = (): TodayScheduleResult => {
  const auth = useRequiredAuth();

  const { todayISO, weekEndISO } = useMemo(() => {
    const now = new Date();
    return {
      todayISO: formatApiDate(now),
      weekEndISO: formatApiDate(addDays(now, 6)),
    };
  }, []);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetWorkingDaysQuery(
      auth
        ? { userId: auth.userId, date_from: todayISO, date_to: weekEndISO }
        : skipToken,
    );

  return useMemo(() => {
    if (!data) {
      return {
        isTodayDayOff: false,
        hasAnySchedule: false,
        isReady: false,
        todayISO,
        isLoading,
        isFetching,
        isError,
        refetch,
      };
    }

    const todayWD = data[todayISO] ?? null;
    const isTodayDayOff = !todayWD || !todayWD.is_active;
    const hasAnySchedule = Object.values(data).some((wd) => wd && wd.is_active);

    return {
      isTodayDayOff,
      hasAnySchedule,
      isReady: true,
      todayISO,
      isLoading,
      isFetching,
      isError,
      refetch,
    };
  }, [data, todayISO, isLoading, isFetching, isError, refetch]);
};
