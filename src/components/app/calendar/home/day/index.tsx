import React, { useCallback, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import DateSelector from "@/src/components/app/calendar/home/day/DateSelector";
import TimeSlotList from "@/src/components/app/calendar/home/day/TimeSlotList";
import CalendarActionButton from "@/src/components/app/calendar/home/сalendarActionButton";

import { useAppSelector } from "@/src/store/redux/store";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { mockSchedule } from "@/src/constants/mockSchedule";
import { type CalendarParams } from "@/src/constants/calendar";
import {
  useGetWorkingDaysQuery,
  useGetWorkingDayQuery,
} from "@/src/store/redux/services/api/workingDaysApi";
import { skipToken } from "@reduxjs/toolkit/query";

const DayCalendarView = () => {
  const router = useRouter();
  const auth = useRequiredAuth();

  const { workingDayId } = useLocalSearchParams<CalendarParams>();

  const selectedDateISO = useAppSelector(
    (state) => state.calendar.selectedDate,
  );
  const selectedDate = useMemo(
    () => new Date(selectedDateISO),
    [selectedDateISO],
  );

  const { data: workingDaysData } = useGetWorkingDaysQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const selectedDateKey = selectedDate.toISOString().split("T")[0];

  const effectiveWorkingDayId =
    workingDayId != null
      ? Number(workingDayId)
      : workingDaysData?.working_days?.find((wd) => wd.day === selectedDateKey)?.id;

  const { data: selectedWorkingDay } = useGetWorkingDayQuery(
    auth && effectiveWorkingDayId != null
      ? { userId: auth.userId, id: effectiveWorkingDayId }
      : skipToken,
  );

  const handleSelectDate = useCallback(
    (id: number, date: Date) => {
      router.setParams({ date: date.toISOString(), workingDayId: String(id) });
    },
    [router],
  );

  const handlePress = useCallback(() => {
    if (!selectedWorkingDay) return;
    router.push(Routers.app.calendar.daySchedule(selectedWorkingDay.id));
  }, [router, selectedWorkingDay]);

  if (!auth) return null;

  return (
    <>
      <DateSelector
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        workingDays={workingDaysData?.working_days ?? []}
      />
      <TimeSlotList
        schedule={mockSchedule}
        startAt={selectedWorkingDay?.start_at}
        endAt={selectedWorkingDay?.end_at}
      />

      <CalendarActionButton onPress={handlePress} />
    </>
  );
};

export default DayCalendarView;
