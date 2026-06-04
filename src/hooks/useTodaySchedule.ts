import { useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { formatApiDate } from "@/src/utils/date/formatDate";

type TodayScheduleResult = {
  hasTodayWorkingDay: boolean;
  isTodayDayOff: boolean;
  isReady: boolean;
  todayISO: string;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
};

export const useTodaySchedule = (): TodayScheduleResult => {
  const auth = useRequiredAuth();

  const todayISO = useMemo(() => formatApiDate(new Date()), []);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetWorkingDaysQuery(
      auth
        ? { userId: auth.userId, date_from: todayISO, date_to: todayISO }
        : skipToken,
    );

  return useMemo(() => {
    if (!data) {
      return {
        hasTodayWorkingDay: false,
        isTodayDayOff: false,
        isReady: false,
        todayISO,
        isLoading,
        isFetching,
        isError,
        refetch,
      };
    }

    const todayWD = data[todayISO] ?? null;

    return {
      hasTodayWorkingDay: !!todayWD,
      isTodayDayOff: !!todayWD && !todayWD.is_active,
      isReady: true,
      todayISO,
      isLoading,
      isFetching,
      isError,
      refetch,
    };
  }, [data, todayISO, isLoading, isFetching, isError, refetch]);
};
