import type { RequestStatus } from "@/src/store/redux/types/request-status";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CalendarMode = "day" | "month";
export type CalendarStatus = RequestStatus;

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
  schedule: Schedule[];
  status: CalendarStatus;
}

const initialState: CalendarState = {
  mode: "day",
  selectedDate: new Date().toISOString(),
  filters: {
    showConfirmed: true,
    showPending: true,
    showCancelled: true,
  },
  schedule: [],
  status: "idle",
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

    setLoading(state) {
      state.status = "loading";
    },

    setBookings(state, action: PayloadAction<Schedule[]>) {
      state.schedule = action.payload;
      state.status = "idle";
    },

    addBooking(state, action: PayloadAction<Schedule>) {
      state.schedule.push(action.payload);
    },

    updateBooking(state, action: PayloadAction<Schedule>) {
      const index = state.schedule.findIndex((b) => b.id === action.payload.id);

      if (index !== -1) {
        state.schedule[index] = action.payload;
      }
    },

    removeBooking(state, action: PayloadAction<string>) {
      state.schedule = state.schedule.filter((b) => b.id !== action.payload);
    },

    setError(state) {
      state.status = "error";
    },

    clearDay(state) {
      state.schedule = [];
    },

    toggleFilter(state, action: PayloadAction<keyof CalendarFilters>) {
      const key = action.payload;
      state.filters[key] = !state.filters[key];
    },

    resetFilters(state) {
      state.filters = {
        showConfirmed: true,
        showPending: true,
        showCancelled: true,
      };
    },
  },
});

export const {
  setMode,
  setSelectedDate,
  setLoading,
  setBookings,
  addBooking,
  updateBooking,
  removeBooking,
  setError,
  clearDay,
  toggleFilter,
  resetFilters,
} = calendarSlice.actions;

export default calendarSlice.reducer;
