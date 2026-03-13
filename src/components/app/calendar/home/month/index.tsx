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
import { skipToken } from "@reduxjs/toolkit/query";
import { endOfMonth, parseISO, startOfMonth, subMonths } from "date-fns";
import { formatApiDate, formatMonthName } from "@/src/utils/date/formatDate";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { setSelectedDay } from "@/src/store/redux/slices/calendarSlice";

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

  const { data: workingDaysData } = useGetWorkingDaysQuery(
    auth
      ? {
          userId: auth.userId,
          date_from: formatApiDate(currentMonth),
          date_to: formatApiDate(endOfMonth(currentMonth)),
        }
      : skipToken,
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
