import React, { useCallback, useEffect } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { IconButton, SegmentedControl, StSvg } from "@/src/components/ui";
import { parseISO } from "date-fns";
import { formatMonthYear } from "@/src/utils/date/formatDate";
import { capitalize } from "@/src/utils/changeСase";
import DayCalendarView from "@/src/components/app/calendar/home/day";
import MonthCalendarView from "@/src/components/app/calendar/home/month";
import CalendarFilterModal from "@/src/components/app/calendar/home/calendarFilterModal";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
  setFilterModalOpen,
  setMode,
  setSelectedDay,
} from "@/src/store/redux/slices/calendarSlice";
import {
  CALENDAR_VIEW_OPTIONS,
  type CalendarParams,
} from "@/src/constants/calendar";
import { colors } from "@/src/styles/colors";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";

const CalendarHome = () => {
  const router = useRouter();
  const { mode = "day", date } = useLocalSearchParams<CalendarParams>();
  const dispatch = useAppDispatch();
  const selectedDay = useAppSelector((state) => state.calendar.selectedDay);
  const isFilterOpen = useAppSelector(
    (state) => state.calendar.isFilterModalOpen,
  );

  const handleOpenFilters = useCallback(() => {
    dispatch(setFilterModalOpen(true));
  }, [dispatch]);
  const handleCloseFilters = useCallback(() => {
    dispatch(setFilterModalOpen(false));
  }, [dispatch]);

  const handleModeChange = useCallback(
    (value: string) => {
      router.setParams({ mode: value, date: selectedDay });
    },
    [router, selectedDay],
  );

  useEffect(() => {
    dispatch(setMode(mode));
    if (date) {
      dispatch(setSelectedDay(date));
    }
  }, [mode, date, dispatch]);

  const title =
    mode === "day" && selectedDay
      ? capitalize(formatMonthYear(parseISO(selectedDay)))
      : "Календарь";

  return (
    <>
      <ScreenWithToolbar
        title={title}
        rightButton={
          mode === "day" && (
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
          )
        }
      >
        {(insets) => (
          <View
            className="flex-1"
            style={{
              marginTop: insets.topInset,
            }}
          >
            <View className="flex-1 gap-4">
              <SegmentedControl
                className="mx-screen"
                value={mode}
                onChange={handleModeChange}
                options={CALENDAR_VIEW_OPTIONS}
              />
              {mode === "month" ? <MonthCalendarView /> : <DayCalendarView />}
            </View>
          </View>
        )}
      </ScreenWithToolbar>

      <CalendarFilterModal
        visible={isFilterOpen}
        onClose={handleCloseFilters}
      />
    </>
  );
};

export default CalendarHome;
