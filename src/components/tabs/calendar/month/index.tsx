import React, { useCallback, useState } from "react";
import { View } from "react-native";
import MonthCalendar from "@/src/components/tabs/calendar/month/MonthCalendar";
import CalendarActionButton from "@/src/components/tabs/calendar/сalendarActionButton";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import CreateActionCard from "@/src/components/shared/cards/createActionCard";
import { colors } from "@/src/styles/colors";

const Schedule = [
  {
    title: "Настроить вручную",
    subtitle: "Выбрать дни и часы работы",
    leftIcon: <StSvg name="Edit" size={24} color={colors.neutral[900]} />,
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
];

const MonthCalendarView = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <View className="px-screen">
        <MonthCalendar selectedDate={new Date()} onSelectDate={() => {}} />
      </View>
      <CalendarActionButton mode="month" onPress={handleOpen} />

      <StModal visible={isOpen} onClose={handleClose}>
        <View className="gap-3">
          <Typography weight="semibold" className="text-display text-center">
            Расписание на Февраль
          </Typography>

          <View className="gap-4 mb-4">
            {Schedule.map((item, key) => (
              <CreateActionCard
                key={key}
                title={item.title}
                subtitle={item.subtitle}
                leftIcon={item.leftIcon}
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
