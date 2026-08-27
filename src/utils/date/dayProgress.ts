import { parseTime } from "@/src/utils/date/formatTime";
import type {
  Appointment,
  WorkingDay,
  WorkingDaysResponse,
} from "@/src/store/redux/services/api-types";

export const calculateDayProgress = (
  workingDay: WorkingDay | null | undefined,
  appointments: Appointment[],
): number | undefined => {
  if (!workingDay || appointments.length === 0) return undefined;

  const wdStart = parseTime(workingDay.start_at);
  const wdEnd = parseTime(workingDay.end_at);
  const availableMinutes =
    wdEnd -
    wdStart -
    (workingDay.working_day_breaks ?? []).reduce(
      (sum, b) => sum + parseTime(b.end_at) - parseTime(b.start_at),
      0,
    );

  if (availableMinutes <= 0) return undefined;

  const bookedMinutes = appointments.reduce((sum, a) => {
    const apptStart = parseTime(a.start_time);
    const apptEnd = parseTime(a.end_time);
    const overlapStart = Math.max(apptStart, wdStart);
    const overlapEnd = Math.min(apptEnd, wdEnd);
    return sum + Math.max(0, overlapEnd - overlapStart);
  }, 0);

  return Math.min(1, bookedMinutes / availableMinutes);
};

export const calculateProgressMap = (
  workingDaysData: WorkingDaysResponse | undefined,
  appointmentsByDate: Record<string, Appointment[]>,
): Record<string, number> => {
  const progressMap: Record<string, number> = {};
  if (!workingDaysData) return progressMap;

  for (const [date, workingDay] of Object.entries(workingDaysData)) {
    const progress = calculateDayProgress(
      workingDay,
      appointmentsByDate[date] ?? [],
    );
    if (progress !== undefined) progressMap[date] = progress;
  }

  return progressMap;
};
