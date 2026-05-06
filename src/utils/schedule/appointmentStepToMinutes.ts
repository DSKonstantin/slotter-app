import type { AppointmentStep } from "@/src/store/redux/services/api-types";

export type AppointmentStepMinutes = 5 | 10 | 15 | 30 | 60;

const STEP_MINUTES: Record<AppointmentStep, AppointmentStepMinutes> = {
  five_minutes: 5,
  ten_minutes: 10,
  fifteen_minutes: 15,
  thirty_minutes: 30,
  one_hour: 60,
};

export const appointmentStepToMinutes = (
  step: AppointmentStep,
): AppointmentStepMinutes => STEP_MINUTES[step];
