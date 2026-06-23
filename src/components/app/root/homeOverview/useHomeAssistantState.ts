import { useCallback, useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useLocalSearchParams } from "expo-router";

import { useAuth } from "@/src/contexts/AuthContext";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import {
  useGetAppointmentsQuery,
  useGetUpcomingAppointmentsQuery,
} from "@/src/store/redux/services/api/appointmentsApi";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { parseTime } from "@/src/utils/date/formatTime";
import type {
  Appointment,
  UpcomingAppointment,
} from "@/src/store/redux/services/api-types";

export type AssistantState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "onboarding"; hasTodaySchedule: boolean }
  | { kind: "no_schedule" }
  | { kind: "day_off" }
  | { kind: "free_day"; startAt: string; endAt: string }
  | { kind: "waiting_next"; appointments: UpcomingAppointment[] }
  | {
      kind: "current_and_next";
      current: Appointment;
      appointments: UpcomingAppointment[];
    }
  | { kind: "completed" };

type Result = {
  state: AssistantState;
  refetch: () => void;
};

export const useHomeAssistantState = (): Result => {
  const { isOnboardingComplete } = useAuth();
  const auth = useRequiredAuth();
  const { fromOnboarding } = useLocalSearchParams<{
    fromOnboarding?: string;
  }>();

  const now = new Date();
  const today = formatApiDate(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const {
    data: workingDaysData,
    isLoading: isWorkingDaysLoading,
    isError: isWorkingDaysError,
    refetch: refetchWorkingDays,
  } = useGetWorkingDaysQuery(
    auth
      ? { userId: auth.userId, date_from: today, date_to: today }
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
            date_from: today,
            date_to: today,
            status: [
              "pending",
              "proposed",
              "confirmed",
              "arrived",
              "completed",
              "no_show",
              "late",
            ],
          },
        }
      : skipToken,
  );

  const {
    data: upcomingData,
    isLoading: isUpcomingLoading,
    isError: isUpcomingError,
    refetch: refetchUpcoming,
  } = useGetUpcomingAppointmentsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const state = useMemo((): AssistantState => {
    const isLoading =
      isWorkingDaysLoading || isAppointmentsLoading || isUpcomingLoading;
    const isError =
      isWorkingDaysError || isAppointmentsError || isUpcomingError;

    if (isOnboardingComplete && fromOnboarding === "1") {
      const hasTodaySchedule = workingDaysData?.[today]?.is_active ?? false;
      return { kind: "onboarding", hasTodaySchedule };
    }

    if (isLoading) return { kind: "loading" };
    if (isError) return { kind: "error" };

    const todayWd = workingDaysData?.[today];

    if (!todayWd) return { kind: "no_schedule" };
    if (!todayWd.is_active) return { kind: "day_off" };

    const endMinutes = parseTime(todayWd.end_at);

    if (endMinutes > 0 && nowMinutes >= endMinutes)
      return { kind: "completed" };

    const todayAppointments =
      (appointmentsData as Record<string, Appointment[]> | undefined)?.[
        today
      ] ?? [];

    const sorted = [...todayAppointments].sort(
      (a, b) => parseTime(a.start_time) - parseTime(b.start_time),
    );

    if (sorted.length === 0)
      return {
        kind: "free_day",
        startAt: todayWd.start_at,
        endAt: todayWd.end_at,
      };

    const current =
      sorted.find((a) => {
        const start = parseTime(a.start_time);
        return nowMinutes >= start && nowMinutes < start + a.duration;
      }) ?? null;

    const upcomingToday = (upcomingData?.appointments ?? []).filter(
      (a) => a.date === today,
    );

    if (current)
      return { kind: "current_and_next", current, appointments: upcomingToday };
    if (upcomingToday.length > 0)
      return { kind: "waiting_next", appointments: upcomingToday };

    if (endMinutes === 0 || nowMinutes < endMinutes)
      return {
        kind: "free_day",
        startAt: todayWd.start_at,
        endAt: todayWd.end_at,
      };

    return { kind: "completed" };
  }, [
    isOnboardingComplete,
    isWorkingDaysLoading,
    isAppointmentsLoading,
    isUpcomingLoading,
    isWorkingDaysError,
    isAppointmentsError,
    isUpcomingError,
    workingDaysData,
    appointmentsData,
    upcomingData,
    today,
    nowMinutes,
    fromOnboarding,
  ]);

  const refetch = useCallback(() => {
    void refetchWorkingDays();
    void refetchAppointments();
    void refetchUpcoming();
  }, [refetchWorkingDays, refetchAppointments, refetchUpcoming]);

  return { state, refetch };
};
