import React, { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";

import DateSelector from "@/src/components/tabs/calendar/home/day/DateSelector";
import TimeSlotList from "@/src/components/tabs/calendar/home/day/TimeSlotList";
import CalendarActionButton from "@/src/components/tabs/calendar/home/сalendarActionButton";

import { useAppSelector } from "@/src/store/redux/store";
import { Routers } from "@/src/constants/routers";
import { mockSchedule as schedule } from "@/src/constants/mockSchedule";

const DayCalendarView = () => {
  const router = useRouter();

  const selectedDateISO = useAppSelector(
    (state) => state.calendar.selectedDate,
  );

  // 1. Мемоизация создания объекта Date, чтобы избежать его пересоздания на каждый рендер.
  const selectedDate = useMemo(
    () => new Date(selectedDateISO),
    [selectedDateISO],
  );

  const datesWithSchedule = useMemo(() => {
    const scheduleByDate: { [key: string]: any[] } = {};
    schedule.forEach((slot) => {
      const dateKey = slot.timeStart.split("T")[0];
      if (!scheduleByDate[dateKey]) {
        scheduleByDate[dateKey] = [];
      }
      scheduleByDate[dateKey].push(slot);
    });
    return scheduleByDate;
  }, [schedule]);

  // 2. Упрощенный обработчик: обновляет только URL. Redux обновится в родительском компоненте.
  // 3. Обернут в useCallback для стабильности.
  const handleSelectDate = useCallback(
    (date: Date) => {
      const iso = date.toISOString();
      router.setParams({ date: iso });
    },
    [router],
  );

  const handlePress = useCallback(() => {
    router.push(Routers.tabs.calendar.daySchedule);
  }, [router]);

  return (
    <>
      <DateSelector
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        schedule={datesWithSchedule}
      />
      <TimeSlotList schedule={schedule} />

      <CalendarActionButton onPress={handlePress} />
    </>
  );
};

export default DayCalendarView;
