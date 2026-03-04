import React, { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";

import DateSelector from "@/src/components/app/calendar/home/day/DateSelector";
import TimeSlotList from "@/src/components/app/calendar/home/day/TimeSlotList";
import CalendarActionButton from "@/src/components/app/calendar/home/сalendarActionButton";

import { useAppSelector } from "@/src/store/redux/store";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  useGetWorkingDaysQuery,
  useGetWorkingDayQuery,
} from "@/src/store/redux/services/api/workingDaysApi";
import type { Schedule } from "@/src/store/redux/slices/calendarSlice";
import { combineDayTime } from "@/src/utils/date/formatTime";

const DayCalendarView = () => {
  const router = useRouter();
  const auth = useRequiredAuth();

  const selectedDateISO = useAppSelector(
    (state) => state.calendar.selectedDate,
  );

  const selectedDate = useMemo(
    () => new Date(selectedDateISO),
    [selectedDateISO],
  );

  const { data: workingDaysData } = useGetWorkingDaysQuery(
    { userId: auth?.userId ?? 0 },
    { skip: !auth },
  );

  const datesWithSchedule = useMemo(() => {
    const result: { [key: string]: any[] } = {};
    (workingDaysData?.working_days ?? []).forEach((wd) => {
      if (!result[wd.day]) result[wd.day] = [];
      result[wd.day].push(wd);
    });
    return result;
  }, [workingDaysData]);

  const selectedDateKey = selectedDate.toISOString().split("T")[0];

  const selectedWorkingDay =
    workingDaysData?.working_days.find((wd) => wd.day === selectedDateKey) ??
    null;

  const { data: workingDay } = useGetWorkingDayQuery(
    { userId: auth?.userId ?? 0, id: selectedWorkingDay?.id ?? 0 },
    { skip: !auth || !selectedWorkingDay },
  );

  const handleSelectDate = useCallback(
    (date: Date) => {
      const iso = date.toISOString();
      router.setParams({ date: iso });
    },
    [router],
  );

  const handlePress = useCallback(() => {
    router.push(Routers.app.calendar.daySchedule);
  }, [router]);

  if (!auth) return null;

  console.log(workingDaysData, "workingDaysData");

  return (
    <>
      <DateSelector
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        schedule={datesWithSchedule}
      />
      <TimeSlotList schedule={[]} />

      <CalendarActionButton onPress={handlePress} />
    </>
  );
};

export default DayCalendarView;
