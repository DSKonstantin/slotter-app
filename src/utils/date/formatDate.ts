import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";

export const formatApiDate = (date: Date) => format(date, "yyyy-MM-dd");

export const formatMonthYear = (date: Date) =>
  format(date, "LLLL yyyy", { locale: ru });

export const formatMonthName = (date: Date) =>
  format(date, "LLLL", { locale: ru });

export const formatFullDateWithDay = (date: Date) =>
  format(date, "d MMMM, EEEE", { locale: ru });

export const formatShortDayName = (date: Date) =>
  format(date, "EEEEEE", { locale: ru });

export const formatDayNumber = (date: Date) => format(date, "d");

export const formatDayMonthLong = (date: Date) =>
  format(date, "d MMMM", { locale: ru });

export const formatDayMonthYearLong = (date: Date) =>
  format(date, "d MMMM yyyy", { locale: ru });

export const formatMessageTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Вчера";
  return format(date, "d MMM", { locale: ru });
};

export const subMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
};
