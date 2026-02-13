import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { format, addDays, isSameDay, endOfMonth, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

interface DateSelectorProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

const ITEM_WIDTH = 44;
const HORIZONTAL_PADDING = 20;
const ITEM_GAP = 12;

const DateSelector: React.FC<DateSelectorProps> = ({
  onSelectDate,
  selectedDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const listRef = useRef<FlatList<Date>>(null);

  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    const lastDay = endOfMonth(today);

    const result: Date[] = [];
    let current = today;

    while (current <= lastDay) {
      result.push(current);
      current = addDays(current, 1);
    }

    return result;
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const initialIndex = useMemo(() => {
    const index = dates.findIndex((d) => isSameDay(d, selectedDate));
    return index >= 0 ? index : 0;
  }, [dates, selectedDate]);

  useEffect(() => {
    const index = dates.findIndex((d) => isSameDay(d, selectedDate));

    if (index !== -1) {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    }
  }, [selectedDate, dates]);

  return (
    <>
      <FlatList
        ref={listRef}
        horizontal
        data={dates}
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
        renderItem={({ item }) => {
          const isSelected = isSameDay(item, selectedDate);
          const isEmptyDay = !isSelected && Math.random() > 0.5;

          return (
            <TouchableOpacity
              onPress={() => {
                if (isEmptyDay) {
                  handleOpen();
                } else {
                  onSelectDate(item);
                }
              }}
              style={{ width: ITEM_WIDTH }}
              className={`items-center justify-between p-[6px] rounded-full ${
                isSelected ? "bg-neutral-900" : "bg-transparent"
              } ${isEmptyDay ? "opacity-20" : ""}`}
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
                  className="text-body text-neutral-900"
                >
                  {format(item, "d")}
                </Typography>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <StModal visible={isOpen} onClose={handleClose}>
        <View className="gap-3">
          <Typography weight="semibold" className="text-display text-center">
            9 октября 2025
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
            onPress={handleClose}
          />
          <Button title="Готово" onPress={handleClose} />
        </View>
      </StModal>
    </>
  );
};

export default DateSelector;
