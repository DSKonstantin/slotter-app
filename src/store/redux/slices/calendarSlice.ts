import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";
import type { AppointmentStatus } from "@/src/store/redux/services/api-types";
import type { RootState } from "@/src/store/redux/store";
import { APPOINTMENT_STATUS_CONFIG } from "@/src/constants/appointmentStatuses";

export type CalendarMode = "day" | "month";

export type ScheduleIntent =
  | { type: "openTemplate" }
  | { type: "duplicateFrom"; date: string }
  | null;

const DEFAULT_ACTIVE_STATUSES = Object.values(APPOINTMENT_STATUS_CONFIG)
  .filter(({ defaultActive }) => defaultActive)
  .map(({ status }) => status);

interface CalendarState {
  mode: CalendarMode;
  selectedDay: string;
  activeStatuses: AppointmentStatus[];
  scheduleIntent: ScheduleIntent;
  isFilterModalOpen: boolean;
  highlightSlotId: number | null;
}

const initialState: CalendarState = {
  mode: "day",
  selectedDay: format(new Date(), "yyyy-MM-dd"),
  activeStatuses: DEFAULT_ACTIVE_STATUSES,
  scheduleIntent: null,
  isFilterModalOpen: false,
  highlightSlotId: null,
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

    setActiveStatuses(state, action: PayloadAction<AppointmentStatus[]>) {
      state.activeStatuses = action.payload;
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
  setActiveStatuses,
  setScheduleIntent,
  setFilterModalOpen,
  setHighlightSlotId,
  clearHighlightSlotId,
} = calendarSlice.actions;

export const selectActiveStatuses = (state: RootState) =>
  state.calendar.activeStatuses;

export default calendarSlice.reducer;
