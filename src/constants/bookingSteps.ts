import type { AppointmentStep } from "@/src/store/redux/services/api-types";

export type AppointmentStepMinutes = 5 | 10 | 15 | 30 | 60 | 120 | 180 | 240;

export const BOOKING_STEPS: {
  value: AppointmentStep;
  label: string;
  minutes: AppointmentStepMinutes;
}[] = [
  { value: "five_minutes", label: "5 минут", minutes: 5 },
  { value: "ten_minutes", label: "10 минут", minutes: 10 },
  { value: "fifteen_minutes", label: "15 минут", minutes: 15 },
  { value: "thirty_minutes", label: "30 минут", minutes: 30 },
  { value: "one_hour", label: "1 час", minutes: 60 },
  { value: "two_hours", label: "2 часа", minutes: 120 },
  { value: "three_hours", label: "3 часа", minutes: 180 },
  { value: "four_hours", label: "4 часа", minutes: 240 },
];

export const formatBookingStep = (value: AppointmentStep) =>
  BOOKING_STEPS.find((s) => s.value === value)?.label ?? value;

export const appointmentStepToMinutes = (
  value: AppointmentStep,
): AppointmentStepMinutes =>
  BOOKING_STEPS.find((s) => s.value === value)?.minutes ?? 60;

const MINUTES_IN_HOUR = 60;

export const getIntervalAmount = (minutes: number) =>
  minutes >= MINUTES_IN_HOUR ? minutes / MINUTES_IN_HOUR : minutes;

export const getIntervalUnit = (minutes: number) => {
  if (minutes < MINUTES_IN_HOUR) return "мин";
  return getIntervalAmount(minutes) === 1 ? "час" : "часа";
};

export const formatInterval = (minutes: number) =>
  `${getIntervalAmount(minutes)} ${getIntervalUnit(minutes)}`;
