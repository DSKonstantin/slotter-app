import React, { useCallback } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAppSelector } from "@/src/store/redux/store";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetUpcomingAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { useTodaySchedule } from "@/src/hooks/useTodaySchedule";
import ShareLinkVariant from "./ShareLinkVariant";
import NextAppointmentVariant from "./NextAppointmentVariant";
import RestVariant from "./RestVariant";
import SetupScheduleVariant from "./SetupScheduleVariant";
import AssistantSkeleton from "./AssistantSkeleton";
import RetryInline from "@/src/components/shared/retryInline";

const SpecialistHomeAssistant = () => {
  const auth = useRequiredAuth();
  const nickname = useAppSelector((s) => s.auth.user?.nickname ?? "");

  const {
    isTodayDayOff,
    hasAnySchedule,
    isReady,
    isError: isScheduleError,
    refetch: refetchSchedule,
  } = useTodaySchedule();

  const {
    data,
    isLoading: isAppointmentsLoading,
    isError: isAppointmentsError,
    refetch: refetchAppointments,
  } = useGetUpcomingAppointmentsQuery(
    auth ? { userId: auth.userId } : skipToken,
    { refetchOnFocus: true },
  );

  const handleRetry = useCallback(() => {
    if (isScheduleError) refetchSchedule();
    if (isAppointmentsError) refetchAppointments();
  }, [
    isScheduleError,
    isAppointmentsError,
    refetchSchedule,
    refetchAppointments,
  ]);

  if (!auth) return null;

  if (isScheduleError || isAppointmentsError) {
    return <RetryInline onRetry={handleRetry} />;
  }

  if (!isReady || isAppointmentsLoading) return <AssistantSkeleton />;

  const appointments = data?.appointments ?? [];

  if (!hasAnySchedule) return <SetupScheduleVariant />;
  if (appointments.length > 0) {
    return <NextAppointmentVariant appointments={appointments} />;
  }
  if (isTodayDayOff) return <RestVariant />;
  if (nickname) return <ShareLinkVariant nickname={nickname} />;

  return null;
};

export default SpecialistHomeAssistant;
