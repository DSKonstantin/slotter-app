import { useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { skipToken } from "@reduxjs/toolkit/query";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  useGetWorkingDaysQuery,
} from "@/src/store/redux/services/api/workingDaysApi";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import type { Appointment } from "@/src/store/redux/services/api-types";
import { buildFormValues } from "@/src/utils/calendar/scheduleHelpers";

export const useCalendarData = (current: Date) => {
  const auth = useRequiredAuth();

  const dateRange = useMemo(() => {
    if (!auth) return null;
    return {
      userId: auth.userId,
      date_from: format(startOfMonth(current), "yyyy-MM-dd"),
      date_to: format(endOfMonth(current), "yyyy-MM-dd"),
    };
  }, [auth, current]);

  const { data: workingDaysData } = useGetWorkingDaysQuery(
    dateRange ?? skipToken,
  );

  const { data: appointmentsData } = useGetAppointmentsQuery(
    dateRange
      ? {
          userId: dateRange.userId,
          params: {
            date_from: dateRange.date_from,
            date_to: dateRange.date_to,
            status: ["pending", "confirmed"],
          },
        }
      : skipToken,
  );

  const appointmentDates = useMemo(() => {
    const data =
      (appointmentsData as Record<string, Appointment[]> | undefined) ?? {};
    return new Set(Object.keys(data).filter((date) => data[date].length > 0));
  }, [appointmentsData]);

  const initialFormValues = useMemo(
    () => buildFormValues(current, workingDaysData),
    [current, workingDaysData],
  );

  return {
    auth,
    workingDaysData,
    appointmentDates,
    initialFormValues,
  };
};
