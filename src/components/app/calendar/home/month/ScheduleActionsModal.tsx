import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import CreateActionCard from "@/src/components/shared/cards/createActionCard";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { formatApiDate, formatMonthName } from "@/src/utils/date/formatDate";
import { subMonths } from "date-fns";
import { useAppDispatch } from "@/src/store/redux/store";
import { setScheduleIntent } from "@/src/store/redux/slices/calendarSlice";

type Props = {
  visible: boolean;
  currentMonth: Date;
  prevMonthName: string;
  onClose: () => void;
};

const ScheduleActionsModal = ({
  visible,
  currentMonth,
  prevMonthName,
  onClose,
}: Props) => {
  const dispatch = useAppDispatch();

  const handleCardPress = useCallback(
    (action?: () => void) => {
      onClose();
      action?.();
    },
    [onClose],
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
        title: "Применить шаблон",
        subtitle: "Настроенный вами график пн-вс",
        leftIcon: <StSvg name="Order" size={24} color={colors.neutral[900]} />,
        action: () => {
          dispatch(setScheduleIntent({ type: "openTemplate" }));
          router.push(
            Routers.app.calendar.schedule(formatApiDate(currentMonth)),
          );
        },
      },
    ],
    [currentMonth, dispatch],
  );

  return (
    <StModal visible={visible} onClose={onClose}>
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

        <Button title="Отмена" onPress={onClose} />
      </View>
    </StModal>
  );
};

export default ScheduleActionsModal;
