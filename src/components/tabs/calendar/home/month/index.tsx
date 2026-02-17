import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import MonthCalendar from "@/src/components/tabs/calendar/home/month/MonthCalendar";
import CalendarActionButton from "@/src/components/tabs/calendar/home/сalendarActionButton";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import CreateActionCard from "@/src/components/shared/cards/createActionCard";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { router } from "expo-router";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MonthCalendarView = () => {
  const { bottom } = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const scheduleActions = useMemo(
    () => [
      {
        title: "Настроить вручную",
        subtitle: "Выбрать дни и часы работы",
        leftIcon: <StSvg name="Edit" size={24} color={colors.neutral[900]} />,
        action: () => {
          router.push(Routers.tabs.calendar.schedule);
        },
      },
      {
        title: "Дублировать прошлый месяц",
        subtitle: "Скопировать график с Января",
        leftIcon: <StSvg name="Folder" size={24} color={colors.neutral[900]} />,
      },
      {
        title: "Применить шаблон",
        subtitle: "Настроенный вами график пн-вс",
        leftIcon: <StSvg name="Order" size={24} color={colors.neutral[900]} />,
      },
    ],
    [],
  );

  const handleCardPress = useCallback(
    (action?: () => void) => {
      handleClose();
      action?.();
    },
    [handleClose],
  );

  return (
    <>
      <ScrollView
        className="px-screen"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + bottom + 74,
        }}
      >
        <MonthCalendar selectedDate={new Date()} onSelectDate={() => {}} />
      </ScrollView>
      <CalendarActionButton mode="month" onPress={handleOpen} />

      <StModal visible={isOpen} onClose={handleClose}>
        <View className="gap-3">
          <Typography weight="semibold" className="text-display text-center">
            Расписание на Февраль
          </Typography>

          <View className="gap-4 mb-4">
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
