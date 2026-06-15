import { useCallback, useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  parseISO,
  startOfMonth,
} from "date-fns";
import { skipToken } from "@reduxjs/toolkit/query";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";

export type WorkingDayStatus = "working" | "inactive" | "absent";

const makeInitialMonth = () => {
  const now = new Date();
  return {
    date_from: formatApiDate(startOfMonth(now)),
    date_to: formatApiDate(endOfMonth(now)),
  };
};

export const useWorkingDaysCalendar = (userId?: number, initialMonth?: string) => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    if (initialMonth) {
      const date = parseISO(initialMonth);
      return {
        date_from: formatApiDate(startOfMonth(date)),
        date_to: formatApiDate(endOfMonth(date)),
      };
    }
    return makeInitialMonth();
  });

  const {
    data: workingDaysData,
    isLoading,
    isError,
    refetch,
  } = useGetWorkingDaysQuery(userId ? { userId, ...visibleMonth } : skipToken);

  const markedDates = useMemo(() => {
    if (!userId || !workingDaysData) return {};
    return eachDayOfInterval({
      start: parseISO(visibleMonth.date_from),
      end: parseISO(visibleMonth.date_to),
    }).reduce<Record<string, { disabled?: boolean }>>((acc, d) => {
      const dateStr = formatApiDate(d);
      const wd = workingDaysData[dateStr];
      acc[dateStr] = wd?.is_active ? {} : { disabled: true };
      return acc;
    }, {});
  }, [userId, workingDaysData, visibleMonth]);

  const getDayStatus = useCallback(
    (date: string): WorkingDayStatus => {
      if (!userId || !workingDaysData) return "working";
      const wd = workingDaysData[date];
      if (!wd) return "absent";
      return wd.is_active ? "working" : "inactive";
    },
    [userId, workingDaysData],
  );

  const getWorkingDayId = useCallback(
    (date: string): number | undefined => workingDaysData?.[date]?.id,
    [workingDaysData],
  );

  const onMonthChange = useCallback(
    (month: { year: number; month: number }) => {
      const date = new Date(month.year, month.month - 1, 1);
      setVisibleMonth({
        date_from: formatApiDate(startOfMonth(date)),
        date_to: formatApiDate(endOfMonth(date)),
      });
    },
    [],
  );

  return {
    markedDates,
    isLoading: !!userId && isLoading,
    isError: !!userId && isError,
    refetch,
    onMonthChange,
    minDate: userId ? formatApiDate(new Date()) : undefined,
    getDayStatus,
    getWorkingDayId,
  };
};
