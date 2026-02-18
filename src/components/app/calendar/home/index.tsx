import React, { useCallback, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ToolbarTop from "@/src/components/navigation/toolbarTop";
import {
  Button,
  Checkbox,
  IconButton,
  SegmentedControl,
  StModal,
  StSvg,
  Typography,
} from "@/src/components/ui";
import DayCalendarView from "@/src/components/app/calendar/home/day";
import MonthCalendarView from "@/src/components/app/calendar/home/month";

import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
  setMode,
  setSelectedDate,
  toggleFilter,
} from "@/src/store/redux/slices/calendarSlice";
import { TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import { CALENDAR_VIEW_OPTIONS } from "@/src/constants/calendar";
import { colors } from "@/src/styles/colors";

type FilterOptionProps = {
  label: string;
  value: boolean;
  onPress: () => void;
};

const FilterOption: React.FC<FilterOptionProps> = ({
  label,
  value,
  onPress,
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    className="py-4 px-5 flex-row items-center bg-background-surface rounded-2xl gap-2.5"
  >
    <Checkbox pressable={false} value={value} />
    <Typography weight="regular" className="text-body">
      {label}
    </Typography>
  </TouchableOpacity>
);

type CalendarFilterModalProps = {
  visible: boolean;
  onClose: () => void;
};

const filterOptions = [
  { label: "Подтвержденные записи", key: "showConfirmed" as const },
  { label: "Ожидающие подтверждения", key: "showPending" as const },
  { label: "Отмененные", key: "showCancelled" as const },
];

const CalendarFilterModal: React.FC<CalendarFilterModalProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.calendar.filters);

  return (
    <StModal visible={visible} onClose={onClose}>
      <View className="gap-6">
        <Typography weight="semibold" className="text-display text-center">
          Фильтры
        </Typography>

        <View className="gap-2">
          <Typography className="text-caption text-neutral-500">
            Показывать:
          </Typography>
          {filterOptions.map(({ label, key }) => (
            <FilterOption
              key={key}
              label={label}
              value={filters[key]}
              onPress={() => dispatch(toggleFilter(key))}
            />
          ))}
        </View>

        <Button title="Применить" onPress={onClose} />
      </View>
    </StModal>
  );
};

const CalendarHome = () => {
  const [isFilterOpen, setFilterOpen] = useState(false);
  const router = useRouter();
  // URL - источник истины. Устанавливаем значение по умолчанию, если оно отсутствует.
  const { mode = "day", date } = useLocalSearchParams<{
    mode?: "day" | "month";
    date?: string;
  }>();
  const dispatch = useAppDispatch();
  const { top } = useSafeAreaInsets();

  const handleOpenFilters = useCallback(() => setFilterOpen(true), []);
  const handleCloseFilters = useCallback(() => setFilterOpen(false), []);

  // Синхронизируем состояние Redux с состоянием URL
  useEffect(() => {
    dispatch(setMode(mode));
    if (date) {
      dispatch(setSelectedDate(date));
    }
  }, [mode, date, dispatch]);

  // Действия пользователя обновляют только URL. useEffect выше обработает обновление Redux.
  const handleModeChange = (value: string) => {
    router.setParams({ mode: value });
  };

  return (
    <>
      <ToolbarTop
        title="Календарь"
        rightButton={
          <IconButton
            icon={
              <StSvg
                name="Filter_alt_fill"
                size={28}
                color={colors.neutral[900]}
              />
            }
            onPress={handleOpenFilters}
          />
        }
      />
      <View
        className="flex-1"
        style={{
          marginTop: TOOLBAR_HEIGHT + top,
        }}
      >
        <View className="flex-1 mt-4 gap-4">
          <SegmentedControl
            className="mx-screen"
            value={mode}
            onChange={handleModeChange}
            options={CALENDAR_VIEW_OPTIONS}
          />
          {mode === "month" ? <MonthCalendarView /> : <DayCalendarView />}
        </View>
      </View>

      <CalendarFilterModal
        visible={isFilterOpen}
        onClose={handleCloseFilters}
      />
    </>
  );
};

export default CalendarHome;
