import { useAppSelector } from "@/src/store/redux/store";

export const useBookingFixedTime = () =>
  useAppSelector((state) => state.bookingFixedTime);
