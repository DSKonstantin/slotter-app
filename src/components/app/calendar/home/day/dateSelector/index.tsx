import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
  memo,
} from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { addDays, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { SCREEN_PADDING } from "@/src/constants/layout";
import type { WorkingDaysResponse } from "@/src/store/redux/services/api-types";

import DateSelectorSkeleton from "./DateSelectorSkeleton";
import DateSelectorModal from "@/src/components/app/calendar/home/day/dateSelector/DateSelectorModal";
import { Typography } from "@/src/components/ui";
import {
  formatShortDayName,
  formatDayNumber,
  formatApiDate,
  isCurrentDay,
} from "@/src/utils/date/formatDate";

const ITEM_WIDTH = 44;
const ITEM_GAP = 12;

interface DateItemProps {
  item: Date;
  isSelected: boolean;
  isEmpty: boolean;
  isToday: boolean;
  workingDayId?: number;
  onPress: (id: number | undefined, date: Date, isEmpty: boolean) => void;
}

const DateItem = memo<DateItemProps>(
  ({
    item,
    isSelected,
    isEmpty,
    isToday: isTodayFlag,
    workingDayId,
    onPress,
  }) => (
    <TouchableOpacity
      onPress={() => onPress(workingDayId, item, isEmpty)}
      style={{ width: ITEM_WIDTH }}
      className={`items-center justify-between p-[6px] min-h-[70px] rounded-full ${
        isSelected ? "bg-neutral-900" : "bg-transparent"
      } ${isEmpty ? "opacity-50" : ""}`}
    >
      <Typography
        weight="regular"
        className={`text-caption my-1 ${
          isSelected
            ? "text-neutral-0"
            : isTodayFlag
              ? "text-primary-blue-500"
              : "text-neutral-500"
        }`}
      >
        {formatShortDayName(item)}
      </Typography>

      <View
        className={`w-[32px] h-[32px] justify-center items-center rounded-full overflow-hidden ${
          isSelected ? "bg-background-surface" : "bg-transparent"
        }`}
      >
        <Typography
          weight="semibold"
          className={`text-body ${
            isSelected
              ? "text-neutral-900"
              : isTodayFlag
                ? "text-primary-blue-500"
                : "text-neutral-900"
          }`}
        >
          {formatDayNumber(item)}
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

    const date = formatApiDate(modalDate);
    setModalDate(null);
    router.push(Routers.app.daySchedule.create(date));
  }, [modalDate]);

  const renderItem = useCallback(
    ({ item }: { item: Date }) => {
      const dateString = formatApiDate(item);
      const workingDay = workingDaysData?.[dateString] ?? undefined;
      const isSelected = isSameDay(item, selectedDate);
      const isEmpty = Boolean(workingDaysData) && !workingDay;
      const isTodayFlag = isCurrentDay(dateString);

      return (
        <DateItem
          item={item}
          isSelected={isSelected}
          isEmpty={isEmpty && !isSelected}
          isToday={isTodayFlag}
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
          paddingHorizontal: SCREEN_PADDING,
        }}
        style={{ flexGrow: 0 }}
      />

      <DateSelectorModal
        modalDate={modalDate}
        onClose={() => setModalDate(null)}
        onCreatePress={handleCreatePress}
      />
    </>
  );
};

export default DateSelector;
