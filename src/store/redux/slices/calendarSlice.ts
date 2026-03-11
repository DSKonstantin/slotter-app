import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";

export type CalendarMode = "day" | "month";

export interface CalendarFilters {
  showConfirmed: boolean;
  showPending: boolean;
  showCancelled: boolean;
}

interface CalendarState {
  mode: CalendarMode;
  selectedDay: string;
  filters: CalendarFilters;
}

const initialState: CalendarState = {
  mode: "day",
  selectedDay: format(new Date(), "yyyy-MM-dd"),
  filters: {
    showConfirmed: true,
    showPending: true,
    showCancelled: true,
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
  },
});

export const { setMode, setSelectedDay, toggleFilter } = calendarSlice.actions;

export default calendarSlice.reducer;
