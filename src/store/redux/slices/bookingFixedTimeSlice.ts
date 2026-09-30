import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { BookingFixedTimeSettings } from "@/src/utils/bookingFixedTime";

const initialState: BookingFixedTimeSettings = {
  enabled: true,
  mode: "fixed",
  interval: 30,
  fixedTimes: [690, 780, 900, 1080, 1170],
  days: ["mon", "tue", "wed", "thu", "fri"],
  dayTimes: {
    mon: [630, 750, 780, 870, 900],
  },
};

const bookingFixedTimeSlice = createSlice({
  name: "bookingFixedTime",
  initialState,
  reducers: {
    setBookingFixedTime(
      _state,
      action: PayloadAction<BookingFixedTimeSettings>,
    ) {
      return action.payload;
    },
  },
});

export const { setBookingFixedTime } = bookingFixedTimeSlice.actions;
export default bookingFixedTimeSlice.reducer;
