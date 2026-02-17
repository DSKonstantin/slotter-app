import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
  memo,
} from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

// Schedule's type is inferred from usage; consider defining a proper type
// in your application's types directory.
type ScheduleEntry = {
  time: string;
  client?: string;
};

type Schedule = {
  [isoDate: string]: ScheduleEntry[];
};

interface DateItemProps {
  item: Date;
  isSelected: boolean;
  isEmpty: boolean;
  onPress: (date: Date, isEmpty: boolean) => void;
}

// 1. Memoized child component for FlatList optimization
const DateItem = memo<DateItemProps>(
  ({ item, isSelected, isEmpty, onPress }) => {
    return (
      <TouchableOpacity
        onPress={() => onPress(item, isEmpty)}
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
          className={`w-[32px] h-[32px] 
             justify-center items-center
             rounded-full ${isSelected ? " bg-background-surface" : "bg-transparent"}`}
        >
          <Typography weight="semibold" className="text-body text-neutral-900">
            {format(item, "d")}
          </Typography>
        </View>
      </TouchableOpacity>
    );
  },
);

interface DateSelectorProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
  schedule: Schedule;
}

const ITEM_WIDTH = 44;
const HORIZONTAL_PADDING = 20;
const ITEM_GAP = 12;

const DateSelector: React.FC<DateSelectorProps> = ({
  onSelectDate,
  selectedDate,
  schedule,
}) => {
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const listRef = useRef<FlatList<Date>>(null);

  // 2. Memoized set of dates that have appointments for quick lookups
  const datesWithSchedule = useMemo(() => {
    const dateSet = new Set<string>();
    Object.keys(schedule).forEach((isoDate) => {
      // Store only the date part (YYYY-MM-DD) for easy comparison
      dateSet.add(isoDate.split("T")[0]);
    });
    return dateSet;
  }, [schedule]);

  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    // Generate dates for a longer range for better user experience
    const lastDay = addDays(today, 60);

    const result: Date[] = [];
    let current = today;

    while (current <= lastDay) {
      result.push(current);
      current = addDays(current, 1);
    }

    return result;
  }, []);

  const handleOpenModal = useCallback((date: Date) => {
    setModalDate(date);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalDate(null);
  }, []);

  const handleDatePress = useCallback(
    (date: Date, isEmpty: boolean) => {
      if (isEmpty) {
        handleOpenModal(date);
      } else {
        onSelectDate(date);
      }
    },
    [handleOpenModal, onSelectDate],
  );

  const initialIndex = useMemo(() => {
    const index = dates.findIndex((d) => isSameDay(d, selectedDate));
    return index > 0 ? index : 0;
  }, [dates, selectedDate]);

  useEffect(() => {
    const index = dates.findIndex((d) => isSameDay(d, selectedDate));
    if (index !== -1 && listRef.current) {
      // Use a timeout to ensure scrolling happens after layout is complete
      const timer = setTimeout(() => {
        listRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5, // Center the item
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedDate, dates]);

  const renderItem = useCallback(
    ({ item }: { item: Date }) => {
      const isSelected = isSameDay(item, selectedDate);
      // 3. Replaced Math.random with a real data check
      const dateString = format(item, "yyyy-MM-dd");
      const isEmpty = !datesWithSchedule.has(dateString);

      return (
        <DateItem
          item={item}
          isSelected={isSelected}
          isEmpty={isEmpty && !isSelected}
          onPress={handleDatePress}
        />
      );
    },
    [selectedDate, handleDatePress, datesWithSchedule],
  );

  return (
    <>
      <FlatList
        ref={listRef}
        horizontal
        data={dates}
        renderItem={renderItem}
        keyExtractor={(item) => item.toISOString()}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: index * (ITEM_WIDTH + ITEM_GAP),
          index,
        })}
        contentContainerStyle={{
          gap: ITEM_GAP,
          paddingHorizontal: HORIZONTAL_PADDING,
        }}
        style={{
          flexGrow: 0,
        }}
      />

      <StModal visible={!!modalDate} onClose={handleCloseModal}>
        <View className="gap-3">
          {/* 4. Dynamic modal content */}
          <Typography weight="semibold" className="text-display text-center">
            {modalDate &&
              format(modalDate, "d MMMM yyyy", {
                locale: ru,
              })}
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
            onPress={handleCloseModal}
          />
          <Button title="Готово" onPress={handleCloseModal} />
        </View>
      </StModal>
    </>
  );
};

export default DateSelector;
