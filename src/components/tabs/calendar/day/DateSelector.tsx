import React, { useMemo, useRef, useEffect } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import {
  format,
  addDays,
  isSameDay,
  endOfMonth,
  startOfDay,
  subDays,
} from "date-fns";
import { ru } from "date-fns/locale";
import { Typography } from "@/src/components/ui";

interface DateSelectorProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

const ITEM_WIDTH = 66;

const DateSelector: React.FC<DateSelectorProps> = ({
  onSelectDate,
  selectedDate,
}) => {
  const listRef = useRef<FlatList<Date>>(null);

  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    const startDate = subDays(today, 1);
    const lastDay = endOfMonth(today);

    const result: Date[] = [];
    let current = startDate;

    while (current <= lastDay) {
      result.push(current);
      current = addDays(current, 1);
    }

    return result;
  }, []);

  useEffect(() => {
    const index = dates.findIndex((d) => isSameDay(d, selectedDate));

    if (index !== -1) {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [selectedDate, dates]);

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={dates}
      keyExtractor={(item) => item.toISOString()}
      showsHorizontalScrollIndicator={false}
      getItemLayout={(_, index) => ({
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
        index,
      })}
      contentContainerStyle={{
        gap: 12,
        paddingHorizontal: 20,
      }}
      style={{
        flexGrow: 0,
      }}
      renderItem={({ item }) => {
        const isSelected = isSameDay(item, selectedDate);
        const isEmptyDay = false;

        return (
          <TouchableOpacity
            onPress={() => onSelectDate(item)}
            className={`items-center justify-between p-[6px] rounded-full ${
              isSelected ? "bg-neutral-900" : "bg-transparent"
            } ${isEmptyDay && !isSelected ? "opacity-20" : ""}`}
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
              className={`w-[32px] h-[32px] 
               justify-center items-center
               rounded-full ${isSelected ? " bg-background-surface" : "bg-transparent"}`}
            >
              <Typography
                weight="semibold"
                className={`text-body  
               text-neutral-900`}
              >
                {format(item, "d")}
              </Typography>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default DateSelector;
