import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
  memo,
} from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { format, addDays, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { ru } from "date-fns/locale";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import type { WorkingDaysResponse } from "@/src/store/redux/services/api-types";

import DateSelectorSkeleton from "./DateSelectorSkeleton";

const ITEM_WIDTH = 44;
const ITEM_GAP = 12;
const HORIZONTAL_PADDING = 20;

interface DateItemProps {
  item: Date;
  isSelected: boolean;
  isEmpty: boolean;
  workingDayId?: number;
  onPress: (id: number | undefined, date: Date, isEmpty: boolean) => void;
}

const DateItem = memo<DateItemProps>(
  ({ item, isSelected, isEmpty, workingDayId, onPress }) => (
    <TouchableOpacity
      onPress={() => onPress(workingDayId, item, isEmpty)}
      style={{ width: ITEM_WIDTH }}
      className={`items-center justify-between p-[6px] rounded-full ${
        isSelected ? "bg-neutral-900" : "bg-transparent"
      } ${isEmpty ? "opacity-50" : ""}`}
    >
      <Typography
        weight="regular"
        className={`text-caption my-1 ${
          isSelected ? "text-neutral-0" : "text-neutral-500"
        }`}
      >
        {format(item, "EEEEEE", { locale: ru })}
      </Typography>

      <View
        className={`w-[32px] h-[32px] justify-center items-center rounded-full ${
          isSelected ? "bg-background-surface" : "bg-transparent"
        }`}
      >
        <Typography weight="semibold" className="text-body text-neutral-900">
          {format(item, "d")}
        </Typography>
      </View>
    </TouchableOpacity>
  ),
);

DateItem.displayName = "DateItem";

interface DateSelectorProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
  workingDaysData?: WorkingDaysResponse;
  isLoading?: boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  onSelectDate,
  selectedDate,
  workingDaysData,
  isLoading = false,
}) => {
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const listRef = useRef<FlatList<Date>>(null);

  const dates = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const result: Date[] = [];
    let current = start;
    while (current <= end) {
      result.push(current);
      current = addDays(current, 1);
    }
    return result;
  }, [selectedDate]);

  const selectedDateIndex = useMemo(
    () =>
      Math.max(
        dates.findIndex((date) => isSameDay(date, selectedDate)),
        0,
      ),
    [dates, selectedDate],
  );

  const handleDatePress = useCallback(
    (id: number | undefined, date: Date, isEmpty: boolean) => {
      if (!workingDaysData) {
        onSelectDate(date);
        return;
      }

      if (isEmpty || !id) {
        setModalDate(date);
      } else {
        onSelectDate(date);
      }
    },
    [onSelectDate, workingDaysData],
  );

  const handleCreatePress = useCallback(() => {
    if (!modalDate) return;

    const date = format(modalDate, "yyyy-MM-dd");
    setModalDate(null);
    router.push(Routers.app.calendar.dayScheduleCreate(date));
  }, [modalDate]);

  const renderItem = useCallback(
    ({ item }: { item: Date }) => {
      const dateString = format(item, "yyyy-MM-dd");
      const workingDay = workingDaysData?.[dateString] ?? undefined;
      const isSelected = isSameDay(item, selectedDate);
      const isEmpty = Boolean(workingDaysData) && !workingDay;

      return (
        <DateItem
          item={item}
          isSelected={isSelected}
          isEmpty={isEmpty && !isSelected}
          workingDayId={workingDay?.id}
          onPress={handleDatePress}
        />
      );
    },
    [workingDaysData, selectedDate, handleDatePress],
  );

  useEffect(() => {
    if (listRef.current) {
      const timer = setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: selectedDateIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedDateIndex]);

  if (isLoading) {
    return <DateSelectorSkeleton />;
  }

  return (
    <>
      <View className="gap-2">
        <Typography
          weight="semibold"
          className="text-caption px-screen capitalize text-center"
        >
          {format(selectedDate, "LLLL yyyy", { locale: ru })}
        </Typography>

        <FlatList
          ref={listRef}
          horizontal
          data={dates}
          renderItem={renderItem}
          keyExtractor={(item) => item.toISOString()}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={selectedDateIndex}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: index * (ITEM_WIDTH + ITEM_GAP),
            index,
          })}
          contentContainerStyle={{
            gap: ITEM_GAP,
            paddingHorizontal: HORIZONTAL_PADDING,
          }}
          style={{ flexGrow: 0 }}
        />
      </View>

      <StModal visible={!!modalDate} onClose={() => setModalDate(null)}>
        <View className="gap-3">
          <Typography
            weight="semibold"
            className="mt-2.5 text-display text-center"
          >
            {modalDate && format(modalDate, "d MMMM yyyy", { locale: ru })}
          </Typography>

          <View className="my-4 items-center gap-2">
            <StSvg name="Calendar_fill" size={48} color={colors.neutral[400]} />
            <Typography className="text-body">
              Записей на этот день нет
            </Typography>
          </View>

          <Button
            title="Добавить запись"
            variant="secondary"
            textVariant="accent"
            rightIcon={
              <StSvg
                name="Add_round_fill"
                size={24}
                color={colors.primary.blue[500]}
              />
            }
            onPress={handleCreatePress}
          />
          <Button title="Готово" onPress={() => setModalDate(null)} />
        </View>
      </StModal>
    </>
  );
};

export default DateSelector;
