import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { formatDayMonthRange } from "@/src/utils/date/formatDate";
import { Divider, Item, StModal, Typography } from "@/src/components/ui";
import { RangeCalendar } from "@/src/components/ui/pickers/RangeCalendar";
import { useCalendarRange } from "@/src/hooks/useCalendarRange";

export const PERIODS = [
  { label: "Сегодня", value: "today" },
  { label: "Текущая неделя", value: "current_week" },
  { label: "Текущий месяц", value: "current_month" },
  { label: "Последние 30 дней", value: "last_30_days" },
] as const;

export const CUSTOM_PERIOD_VALUE = "custom" as const;

export type Period =
  | (typeof PERIODS)[number]
  | {
      label: string;
      value: typeof CUSTOM_PERIOD_VALUE;
      date_from?: string;
      date_to?: string;
    };

type Props = {
  visible: boolean;
  selectedPeriod: Period;
  onClose: () => void;
  onSelectPeriod: (period: Period) => void;
};

const PeriodModal = ({
  visible,
  selectedPeriod,
  onClose,
  onSelectPeriod,
}: Props) => {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const { start, end, onDayPress, reset, setRange } = useCalendarRange();

  const handleSelectPeriod = (period: Period) => {
    setCalendarVisible(false);
    reset();
    onSelectPeriod(period);
  };

  const handleApply = () => {
    if (!start) return;
    const rangeEnd = end ?? start;
    const label = formatDayMonthRange(new Date(start), new Date(rangeEnd));
    onSelectPeriod({
      label,
      value: CUSTOM_PERIOD_VALUE,
      date_from: start,
      date_to: rangeEnd,
    });
    onClose();
  };

  useEffect(() => {
    if (!visible) {
      setCalendarVisible(false);
      reset();
    } else if (selectedPeriod.value === CUSTOM_PERIOD_VALUE) {
      setCalendarVisible(true);
      setRange(
        selectedPeriod.date_from && selectedPeriod.date_to
          ? { from: selectedPeriod.date_from, to: selectedPeriod.date_to }
          : null,
      );
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      scrollable={calendarVisible}
      fullHeight={calendarVisible}
      header={
        <Typography weight="semibold" className="text-display text-center">
          Выберите период
        </Typography>
      }
    >
      <View className="gap-2 mt-6 bg-background-surface p-4 rounded-base">
        {PERIODS.map((period, index) => (
          <React.Fragment key={period.value}>
            <Item
              title={period.label}
              active={selectedPeriod.value === period.value}
              className="border-transparent rounded-none min-h-[24px] p-0"
              onPress={() => handleSelectPeriod(period)}
            />
            {index < PERIODS.length - 1 && <Divider className="my-2" />}
          </React.Fragment>
        ))}
        <Divider className="my-2" />
        <Item
          title="Выбрать другой период..."
          active={selectedPeriod.value === CUSTOM_PERIOD_VALUE}
          className="border-transparent rounded-none min-h-[24px] p-0"
          onPress={() => setCalendarVisible(true)}
        />
      </View>

      {calendarVisible && (
        <RangeCalendar
          start={start}
          end={end}
          onDayPress={onDayPress}
          onApply={handleApply}
        />
      )}
    </StModal>
  );
};

export default PeriodModal;
