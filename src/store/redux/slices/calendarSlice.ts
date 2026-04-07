import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";
import type { AppointmentStatus } from "@/src/store/redux/services/api-types";
import type { RootState } from "@/src/store/redux/store";

export type CalendarMode = "day" | "month";

export interface CalendarFilters {
  showPending: boolean;
  showConfirmed: boolean;
  showArrived: boolean;
  showLate: boolean;
  showCompleted: boolean;
  showNoShow: boolean;
  showCancelled: boolean;
}

export type ScheduleIntent =
  | { type: "openTemplate" }
  | { type: "duplicateFrom"; date: string }
  | null;

interface CalendarState {
  mode: CalendarMode;
  selectedDay: string;
  filters: CalendarFilters;
  scheduleIntent: ScheduleIntent;
  isFilterModalOpen: boolean;
  highlightSlotId: number | null;
}

const initialState: CalendarState = {
  mode: "day",
  selectedDay: format(new Date(), "yyyy-MM-dd"),
  scheduleIntent: null,
  isFilterModalOpen: false,
  highlightSlotId: 341,
  filters: {
    showPending: true,
    showConfirmed: true,
    showArrived: true,
    showLate: true,
    showCompleted: true,
    showNoShow: true,
    showCancelled: false,
  },
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<CalendarMode>) {
      state.mode = action.payload;
    },

    setSelectedDay(state, action: PayloadAction<string>) {
      state.selectedDay = action.payload;
    },

    toggleFilter(state, action: PayloadAction<keyof CalendarFilters>) {
      const key = action.payload;
      state.filters[key] = !state.filters[key];
    },

    setFilters(state, action: PayloadAction<CalendarFilters>) {
      state.filters = action.payload;
    },

    setScheduleIntent(state, action: PayloadAction<ScheduleIntent>) {
      state.scheduleIntent = action.payload;
    },

    setFilterModalOpen(state, action: PayloadAction<boolean>) {
      state.isFilterModalOpen = action.payload;
    },

    setHighlightSlotId(state, action: PayloadAction<number>) {
      state.highlightSlotId = action.payload;
    },

    clearHighlightSlotId(state) {
      state.highlightSlotId = null;
    },
  },
});

export const {
  setMode,
  setSelectedDay,
  toggleFilter,
  setFilters,
  setScheduleIntent,
  setFilterModalOpen,
  setHighlightSlotId,
  clearHighlightSlotId,
} = calendarSlice.actions;

export const selectActiveStatuses = createSelector(
  (state: RootState) => state.calendar.filters,
  (filters): AppointmentStatus[] => {
    const map: [boolean, AppointmentStatus][] = [
      [filters.showPending, "pending"],
      [filters.showConfirmed, "confirmed"],
      [filters.showArrived, "arrived"],
      [filters.showLate, "late"],
      [filters.showCompleted, "completed"],
      [filters.showNoShow, "no_show"],
      [filters.showCancelled, "cancelled"],
    ];
    return map.filter(([active]) => active).map(([, status]) => status);
  },
);

export default calendarSlice.reducer;
