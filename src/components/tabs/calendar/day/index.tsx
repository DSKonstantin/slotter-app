import React, { useCallback } from "react";
import DateSelector from "@/src/components/tabs/calendar/day/DateSelector";
import TimeSlotList from "@/src/components/tabs/calendar/day/TimeSlotList";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store/redux/store";
import { setSelectedDate } from "@/src/store/redux/slices/calendarSlice";
import { useRouter } from "expo-router";
import CalendarActionButton from "@/src/components/tabs/calendar/сalendarActionButton";

const DayCalendarView = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const schedule = useSelector((state: RootState) => state.calendar.schedule);
  const selectedDateISO = useSelector(
    (state: RootState) => state.calendar.selectedDate,
  );

  const selectedDate = new Date(selectedDateISO);

  const handleSelectDate = (date: Date) => {
    const iso = date.toISOString();

    dispatch(setSelectedDate(iso));

    router.setParams({
      date: iso,
    });
  };

  const handlePress = useCallback(() => {}, []);

  return (
    <>
      <DateSelector
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
      />
      <TimeSlotList schedule={schedule} />

      <CalendarActionButton onPress={handlePress} />
    </>
  );
};

export default DayCalendarView;
