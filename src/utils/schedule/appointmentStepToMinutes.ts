export type AppointmentStep =
  | "five_minutes"
  | "ten_minutes"
  | "fifteen_minutes"
  | "thirty_minutes"
  | "one_hour";

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
