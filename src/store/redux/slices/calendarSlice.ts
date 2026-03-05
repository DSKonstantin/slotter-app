import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CalendarMode = "day" | "month";

export type ScheduleStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "available";

export interface Schedule {
  id: string;
  clientName?: string;
  timeStart: string;
  timeEnd: string;
  price?: number;
  status: ScheduleStatus;
  services?: string[];
}

export interface CalendarFilters {
  showConfirmed: boolean;
  showPending: boolean;
  showCancelled: boolean;
}

interface CalendarState {
  mode: CalendarMode;
  selectedDate: string;
  filters: CalendarFilters;
}

const initialState: CalendarState = {
  mode: "day",
  selectedDate: new Date().toISOString(),
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

    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },

    toggleFilter(state, action: PayloadAction<keyof CalendarFilters>) {
      const key = action.payload;
      state.filters[key] = !state.filters[key];
    },
  },
});

export const { setMode, setSelectedDate, toggleFilter } = calendarSlice.actions;

export default calendarSlice.reducer;
