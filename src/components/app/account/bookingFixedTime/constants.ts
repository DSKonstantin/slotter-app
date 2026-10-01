import type {
  BookingFixedTimeSettings,
  FixedTimeMode,
} from "@/src/utils/bookingFixedTime";

export type { DayId, FixedTimeMode } from "@/src/utils/bookingFixedTime";

export type BookingFixedTimeFormValues = BookingFixedTimeSettings;

export const MODE_OPTIONS: { label: string; value: FixedTimeMode }[] = [
  { label: "Фиксированное", value: "fixed" },
  { label: "По дням недели", value: "weekly" },
];

export const MODAL_BACK_BUTTON_CLASS =
  "bg-background-surface h-11 w-11 left-4 top-2";
export const MODAL_CONFIRM_BUTTON_CLASS =
  "bg-primary-blue-500 h-11 w-11 right-4 top-2";
