import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
  memo,
} from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { format, addDays, isSameDay, startOfDay, endOfMonth } from "date-fns";
import { ru } from "date-fns/locale";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { WorkingDay } from "@/src/store/redux/services/api-types";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";

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

interface DateSelectorProps {
  onSelectDate: (id: number, date: Date) => void;
  selectedDate: Date;
  workingDays: WorkingDay[];
}

const ITEM_WIDTH = 44;
const HORIZONTAL_PADDING = 20;
const ITEM_GAP = 12;

const DateSelector: React.FC<DateSelectorProps> = ({
  onSelectDate,
  selectedDate,
  workingDays,
}) => {
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const listRef = useRef<FlatList<Date>>(null);

  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    const monthEnd = endOfMonth(today);
    const result: Date[] = [];
    let current = today;
    while (current <= monthEnd) {
      result.push(current);
      current = addDays(current, 1);
    }
    return result;
  }, []);

  const handleDatePress = useCallback(
    (id: number | undefined, date: Date, isEmpty: boolean) => {
      if (isEmpty) {
        setModalDate(date);
      } else if (id !== undefined) {
        onSelectDate(id, date);
      }
    },
    [onSelectDate],
  );

  const renderItem = useCallback(
    ({ item }: { item: Date }) => {
      const dateString = format(item, "yyyy-MM-dd");
      const workingDay = workingDays.find((wd) => wd.day === dateString);
      const isEmpty = !workingDay;

      return (
        <DateItem
          item={item}
          isSelected={isSameDay(item, selectedDate)}
          isEmpty={isEmpty && !isSameDay(item, selectedDate)}
          workingDayId={workingDay?.id}
          onPress={handleDatePress}
        />
      );
    },
    [selectedDate, handleDatePress, workingDays],
  );

  useEffect(() => {
    const index = dates.findIndex((d) => isSameDay(d, selectedDate));
    if (index !== -1 && listRef.current) {
      const timer = setTimeout(() => {
        listRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedDate, dates]);

  return (
    <>
      <FlatList
        ref={listRef}
        horizontal
        data={dates}
        renderItem={renderItem}
        keyExtractor={(item) => item.toISOString()}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={
          dates.findIndex((d) => isSameDay(d, selectedDate)) || 0
        }
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

      <StModal visible={!!modalDate} onClose={() => setModalDate(null)}>
        <View className="gap-3">
          <Typography weight="semibold" className="text-display text-center">
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
            onPress={() => {
              setModalDate(null);
              router.push(Routers.app.calendar.schedule);
            }}
          />
          <Button title="Готово" onPress={() => setModalDate(null)} />
        </View>
      </StModal>
    </>
  );
};

export default DateSelector;
