import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import MonthCalendar from "@/src/components/app/calendar/home/month/MonthCalendar";
import CalendarActionButton from "@/src/components/app/calendar/home/сalendarActionButton";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import CreateActionCard from "@/src/components/shared/cards/createActionCard";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { router, useRouter } from "expo-router";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { endOfMonth, parseISO, startOfMonth, subMonths } from "date-fns";
import { formatApiDate, formatMonthName } from "@/src/utils/date/formatDate";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { setSelectedDay } from "@/src/store/redux/slices/calendarSlice";
import type {
  Appointment,
  WorkingDay,
} from "@/src/store/redux/services/api-types";
import { parseTime } from "@/src/utils/date/formatTime";

const MonthCalendarView = () => {
  const { bottom } = useSafeAreaInsets();
  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();
  const routerInstance = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const selectedDay = useAppSelector((state) => state.calendar.selectedDay);
  const selectedDate = useMemo(() => parseISO(selectedDay), [selectedDay]);
  const currentMonth = useMemo(
    () => startOfMonth(selectedDate),
    [selectedDate],
  );

  const { data: workingDaysData, isLoading: isWorkingDaysLoading } = useGetWorkingDaysQuery(
    auth
      ? {
          userId: auth.userId,
          date_from: formatApiDate(currentMonth),
          date_to: formatApiDate(endOfMonth(currentMonth)),
        }
      : skipToken,
  );

  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useGetAppointmentsQuery(
    auth
      ? {
          userId: auth.userId,
          params: {
            date_from: formatApiDate(currentMonth),
            date_to: formatApiDate(endOfMonth(currentMonth)),
            status: ["pending", "confirmed"],
          },
        }
      : skipToken,
  );

  const appointmentsByDate = useMemo(
    () => (appointmentsData as Record<string, Appointment[]> | undefined) ?? {},
    [appointmentsData],
  );

  const progressMap = useMemo((): Record<string, number> => {
    if (!workingDaysData) return {};

    const result: Record<string, number> = {};

    for (const [date, workingDay] of Object.entries(workingDaysData)) {
      if (!workingDay) continue;

      const dayAppointments = appointmentsByDate[date] ?? [];
      if (dayAppointments.length === 0) continue;

      const wd = workingDay as WorkingDay;
      const availableMinutes =
        parseTime(wd.end_at) -
        parseTime(wd.start_at) -
        (wd.working_day_breaks ?? []).reduce(
          (sum, b) => sum + parseTime(b.end_at) - parseTime(b.start_at),
          0,
        );

      if (availableMinutes <= 0) continue;

      const bookedMinutes = dayAppointments.reduce(
        (sum, a) => sum + a.duration,
        0,
      );
      result[date] = Math.min(1, bookedMinutes / availableMinutes);
    }

    return result;
  }, [workingDaysData, appointmentsByDate]);

  const totalAppointments = useMemo(
    () =>
      Object.values(appointmentsByDate).reduce(
        (sum, arr) => sum + arr.length,
        0,
      ),
    [appointmentsByDate],
  );

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelectDate = useCallback(
    (date: Date) => {
      routerInstance.setParams({
        mode: "day",
        date: formatApiDate(date),
      });
    },
    [routerInstance],
  );

  const handleMonthChange = useCallback(
    (date: Date) => {
      dispatch(setSelectedDay(formatApiDate(date)));
    },
    [dispatch],
  );

  const prevMonthName = useMemo(
    () => formatMonthName(subMonths(currentMonth, 1)),
    [currentMonth],
  );

  const scheduleActions = useMemo(
    () => [
      {
        title: "Настроить вручную",
        subtitle: "Выбрать дни и часы работы",
        leftIcon: <StSvg name="Edit" size={24} color={colors.neutral[900]} />,
        action: () => {
          router.push(
            Routers.app.calendar.schedule(formatApiDate(currentMonth)),
          );
        },
      },
      {
        title: "Дублировать прошлый месяц",
        subtitle: `Скопировать график с ${prevMonthName}`,
        leftIcon: <StSvg name="Folder" size={24} color={colors.neutral[900]} />,
      },
      {
        title: "Применить шаблон",
        subtitle: "Настроенный вами график пн-вс",
        leftIcon: <StSvg name="Order" size={24} color={colors.neutral[900]} />,
      },
    ],
    [currentMonth, prevMonthName],
  );

  const handleCardPress = useCallback(
    (action?: () => void) => {
      handleClose();
      action?.();
    },
    [handleClose],
  );

  if (!auth) return null;

  return (
    <>
      <ScrollView
        className="px-screen"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + bottom + 80,
        }}
      >
        <MonthCalendar
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          progressMap={progressMap}
          totalAppointments={totalAppointments}
          isLoading={isWorkingDaysLoading || isAppointmentsLoading}
        />
      </ScrollView>
      <CalendarActionButton mode="month" onPress={handleOpen} />

      <StModal visible={isOpen} onClose={handleClose}>
        <View className="gap-3">
          <Typography weight="semibold" className="text-display text-center">
            Расписание на {formatMonthName(currentMonth)}
          </Typography>

          <View className="gap-4 my-4">
            {scheduleActions.map((item) => (
              <CreateActionCard
                key={item.title}
                title={item.title}
                subtitle={item.subtitle}
                leftIcon={item.leftIcon}
                onPress={() => handleCardPress(item.action)}
              />
            ))}
          </View>

          <Button title="Отмена" onPress={handleClose} />
        </View>
      </StModal>
    </>
  );
};

export default MonthCalendarView;
