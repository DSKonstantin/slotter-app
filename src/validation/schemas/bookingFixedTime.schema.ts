import * as Yup from "yup";
import { days } from "@/src/constants/days";
import type {
  DayId,
  FixedTimeMode,
} from "@/src/components/app/account/bookingFixedTime/constants";

type DayTimes = Partial<Record<DayId, number[]>>;

const isOnInterval = (time: number, interval: number) => time % interval === 0;

export const bookingFixedTimeSchema = Yup.object({
  enabled: Yup.boolean().required(),
  mode: Yup.mixed<FixedTimeMode>().oneOf(["fixed", "weekly"]).required(),
  interval: Yup.number().required(),
  fixedTimes: Yup.array().of(Yup.number().required()).required(),
  days: Yup.array().of(Yup.mixed<DayId>().required()).required(),
  dayTimes: Yup.mixed<DayTimes>().required(),
}).test("booking-fixed-time", function validate(values) {
  const { enabled, mode, interval, fixedTimes, days: selectedDays } = values;
  const dayTimes = values.dayTimes ?? {};
  const allTimes = [...fixedTimes, ...Object.values(dayTimes).flat()];

  if (allTimes.some((time) => !isOnInterval(time, interval))) {
    return this.createError({
      path: "interval",
      message: "Времена должны быть кратны интервалу сетки",
    });
  }

  if (!enabled) return true;

  if (mode === "fixed" && fixedTimes.length === 0) {
    return this.createError({
      path: "fixedTimes",
      message: "Выберите хотя бы одно время",
    });
  }

  if (mode === "weekly") {
    if (selectedDays.length === 0) {
      return this.createError({
        path: "days",
        message: "Выберите хотя бы один день",
      });
    }
    const emptyDays = days.filter(
      (day) =>
        selectedDays.includes(day.id) && !(dayTimes[day.id]?.length ?? 0),
    );
    if (emptyDays.length > 0) {
      return this.createError({
        path: "dayTimes",
        message: `Выберите время для: ${emptyDays.map((day) => day.label).join(", ")}`,
      });
    }
  }

  return true;
});
