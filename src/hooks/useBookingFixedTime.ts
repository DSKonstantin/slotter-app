import { useMemo } from "react";
import { useAppSelector } from "@/src/store/redux/store";
import { bookingFixedTimeFromApi } from "@/src/utils/bookingFixedTimeApi";

export const useBookingFixedTimeState = () => {
  const api = useAppSelector((state) => state.auth.user?.booking_fixed_time);
  const settings = useMemo(() => bookingFixedTimeFromApi(api), [api]);
  return { settings, isLoaded: api !== undefined };
};

export const useBookingFixedTime = () => useBookingFixedTimeState().settings;
