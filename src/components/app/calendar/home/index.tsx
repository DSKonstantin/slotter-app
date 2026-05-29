import React, { useCallback, useEffect, useMemo } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { IconButton, SegmentedControl, StSvg } from "@/src/components/ui";
import { isValid, parseISO } from "date-fns";
import { formatMonthYear } from "@/src/utils/date/formatDate";
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
import capitalize from "lodash/capitalize";

const CalendarHome = () => {
  const dispatch = useAppDispatch();
  const selectedDay = useAppSelector((state) => state.calendar.selectedDay);
  const isFilterOpen = useAppSelector(
    (state) => state.calendar.isFilterModalOpen,
  );
  const router = useRouter();
  const { mode = "day", date } = useLocalSearchParams<CalendarParams>();

  const title = useMemo(() => {
    if (mode !== "day" || !selectedDay) return "Календарь";
    const d = parseISO(selectedDay);
    return isValid(d) ? capitalize(formatMonthYear(d)) : "Календарь";
  }, [mode, selectedDay]);

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

  return (
    <>
      <ScreenWithToolbar
        showBack={false}
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
            className="flex-1 gap-4"
            style={{
              marginTop: insets.topInset,
            }}
          >
            <SegmentedControl
              className="mx-screen"
              value={mode}
              onChange={handleModeChange}
              options={CALENDAR_VIEW_OPTIONS}
            />
            {mode === "month" ? <MonthCalendarView /> : <DayCalendarView />}
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
