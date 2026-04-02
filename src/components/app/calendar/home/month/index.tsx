import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import MonthCalendar from "@/src/components/app/calendar/home/month/MonthCalendar";
import CalendarActionButton from "@/src/components/app/calendar/home/сalendarActionButton";
import { parseISO, startOfMonth, subMonths } from "date-fns";
import { formatApiDate, formatMonthName } from "@/src/utils/date/formatDate";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppSelector } from "@/src/store/redux/store";
import { useRouter } from "expo-router";
import ScheduleActionsModal from "./ScheduleActionsModal";
import ErrorScreen from "@/src/components/shared/errorScreen";
import useMonthCalendarData from "@/src/hooks/useMonthCalendarData";

const MonthCalendarView = () => {
  const { bottom } = useSafeAreaInsets();
  const auth = useRequiredAuth();
  const routerInstance = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const selectedDay = useAppSelector((state) => state.calendar.selectedDay);
  const selectedDate = useMemo(() => parseISO(selectedDay), [selectedDay]);

  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(parseISO(selectedDay)),
  );
  const [pendingMonth, setPendingMonth] = useState<Date | null>(null);

  const fetchMonth = pendingMonth ?? currentMonth;

  const {
    calendarData,
    isLoading,
    isError,
    hasData,
    refreshing,
    handleRefresh,
  } = useMonthCalendarData({ auth, fetchMonth, currentMonth });

  const handleSelectDate = useCallback(
    (date: Date) => {
      routerInstance.setParams({ mode: "day", date: formatApiDate(date) });
    },
    [routerInstance],
  );

  const handleMonthChange = useCallback((date: Date) => {
    setPendingMonth(startOfMonth(date));
  }, []);

  useEffect(() => {
    if (!isLoading && pendingMonth) {
      setCurrentMonth(pendingMonth);
      setPendingMonth(null);
    }
  }, [isLoading, pendingMonth]);

  if (!auth) return null;

  if (isError && !hasData) {
    return (
      <ErrorScreen
        title="Не удалось загрузить календарь"
        isLoading={isLoading}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <>
      <ScrollView
        className="px-screen"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + bottom + 80,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <MonthCalendar
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          data={{ ...calendarData, isLoading }}
        />
      </ScrollView>

      <CalendarActionButton mode="month" onPress={() => setIsOpen(true)} />

      <ScheduleActionsModal
        visible={isOpen}
        currentMonth={currentMonth}
        prevMonthName={formatMonthName(subMonths(currentMonth, 1))}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default MonthCalendarView;
