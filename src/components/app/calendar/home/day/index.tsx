import React, { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";

import DateSelector from "@/src/components/app/calendar/home/day/DateSelector";
import TimeSlotList from "@/src/components/app/calendar/home/day/timeSlotList";
import CalendarActionButton from "@/src/components/app/calendar/home/сalendarActionButton";

import { useAppSelector } from "@/src/store/redux/store";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { mockSchedule } from "@/src/constants/mockSchedule";

const DayCalendarView = () => {
  const router = useRouter();
  const auth = useRequiredAuth();

  const selectedDay = useAppSelector((state) => state.calendar.selectedDay);

  const selectedDate = useMemo(() => parseISO(selectedDay), [selectedDay]);

  const dateRange = useMemo(
    () => ({
      date_from: format(startOfMonth(selectedDate), "yyyy-MM-dd"),
      date_to: format(endOfMonth(selectedDate), "yyyy-MM-dd"),
    }),
    [selectedDate],
  );

  const { data: workingDaysData, isLoading: isDayLoading } =
    useGetWorkingDaysQuery(
      auth ? { userId: auth.userId, ...dateRange } : skipToken,
    );

  const selectedWorkingDay = workingDaysData?.[selectedDay] ?? undefined;

  const handleSelectDate = useCallback(
    (date: Date) => {
      router.setParams({ date: format(date, "yyyy-MM-dd") });
    },
    [router],
  );

  const handlePress = useCallback(() => {
    if (!selectedWorkingDay) {
      if (!workingDaysData) return;
      router.push(Routers.app.calendar.dayScheduleCreate(selectedDay));
      return;
    }
    router.push(Routers.app.calendar.slotSelectService({ date: selectedDay }));
  }, [router, selectedWorkingDay, workingDaysData, selectedDay]);

  if (!auth) return null;

  return (
    <>
      <DateSelector
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
      />
      <TimeSlotList
        // schedule={[]}
        schedule={mockSchedule}
        startAt={selectedWorkingDay?.start_at}
        endAt={selectedWorkingDay?.end_at}
        isLoading={isDayLoading}
      />

      <CalendarActionButton
        onPress={handlePress}
        title={selectedWorkingDay ? "Создать запись" : "Настроить день"}
      />
    </>
  );
};

export default DayCalendarView;
