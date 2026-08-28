import type { AppointmentStep } from "@/src/store/redux/services/api-types/user";

export type { AppointmentStep };

export type AppointmentStepMinutes = 5 | 10 | 15 | 30 | 60 | 120 | 180 | 240;

const STEP_MINUTES: Record<AppointmentStep, AppointmentStepMinutes> = {
  five_minutes: 5,
  ten_minutes: 10,
  fifteen_minutes: 15,
  thirty_minutes: 30,
  one_hour: 60,
  two_hours: 120,
  three_hours: 180,
  four_hours: 240,
};

export const appointmentStepToMinutes = (
  step: AppointmentStep,
): AppointmentStepMinutes => STEP_MINUTES[step];
