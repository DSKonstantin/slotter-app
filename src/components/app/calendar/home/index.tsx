import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { IconButton, SegmentedControl, StSvg } from "@/src/components/ui";
import DayCalendarView from "@/src/components/app/calendar/home/day";
import MonthCalendarView from "@/src/components/app/calendar/home/month";
import CalendarFilterModal from "@/src/components/app/calendar/home/calendarFilterModal";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
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
  const [isFilterOpen, setFilterOpen] = useState(false);
  const router = useRouter();
  const { mode = "day", date } = useLocalSearchParams<CalendarParams>();
  const dispatch = useAppDispatch();
  const selectedDay = useAppSelector((state) => state.calendar.selectedDay);

  const handleOpenFilters = useCallback(() => setFilterOpen(true), []);
  const handleCloseFilters = useCallback(() => setFilterOpen(false), []);

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

  return (
    <>
      <ScreenWithToolbar
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
