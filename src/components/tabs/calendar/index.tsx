import React, { useCallback, useEffect, useState } from "react";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import {
  IconButton,
  SegmentedControl,
  StSvg,
  Button,
  StModal,
  Typography,
  Checkbox,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import { TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MonthCalendarView from "@/src/components/tabs/calendar/month";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store/redux/store";
import {
  setMode,
  setSelectedDate,
  toggleFilter,
} from "@/src/store/redux/slices/calendarSlice";
import DayCalendarView from "@/src/components/tabs/calendar/day";

const TabCalendar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { mode, date } = useLocalSearchParams<{
    mode?: string;
    date?: string;
  }>();

  const dispatch = useDispatch();
  const { top } = useSafeAreaInsets();

  const calendarMode = useSelector((state: RootState) => state.calendar.mode);
  const filters = useSelector((state: RootState) => state.calendar.filters);
  const reduxDate = useSelector(
    (state: RootState) => state.calendar.selectedDate,
  );

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (mode) {
      dispatch(setMode(mode === "month" ? "month" : "day"));
    }

    if (date) {
      dispatch(setSelectedDate(date));
    }
  }, [mode, date, dispatch]);

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
            onPress={handleOpen}
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
            value={calendarMode}
            onChange={(value) => {
              dispatch(setMode(value as "day" | "month"));
              router.setParams({
                mode: value,
                date: reduxDate,
              });
            }}
            options={[
              { label: "День", value: "day" },
              { label: "Месяц", value: "month" },
            ]}
          />
          {mode === "month" ? <MonthCalendarView /> : <DayCalendarView />}
        </View>
      </View>

      <StModal visible={isOpen} onClose={handleClose}>
        <View className="gap-6">
          <Typography weight="semibold" className="text-display text-center">
            Фильтры
          </Typography>

          <View className="gap-2">
            <Typography className="text-caption text-neutral-500">
              Показывать:
            </Typography>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => dispatch(toggleFilter("showConfirmed"))}
              className="py-4 px-5 flex-row items-center bg-background-surface rounded-2xl gap-2.5"
            >
              <Checkbox pressable={false} value={filters.showConfirmed} />
              <Typography weight="regular" className="text-body">
                Подтвержденные записи
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => dispatch(toggleFilter("showPending"))}
              className="py-4 px-5 flex-row items-center bg-background-surface rounded-2xl gap-2.5"
            >
              <Checkbox pressable={false} value={filters.showPending} />
              <Typography weight="regular" className="text-body">
                Ожидающие подтверждения
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => dispatch(toggleFilter("showCancelled"))}
              className="py-4 px-5 flex-row items-center bg-background-surface rounded-2xl gap-2.5"
            >
              <Checkbox pressable={false} value={filters.showCancelled} />
              <Typography weight="regular" className="text-body">
                Отмененные
              </Typography>
            </TouchableOpacity>
          </View>

          <Button title="Применить" onPress={handleClose} />
        </View>
      </StModal>
    </>
  );
};

export default TabCalendar;
