import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";

export const formatApiDate = (date: Date) => format(date, "yyyy-MM-dd");
export const formatSlotDate = (date: Date) => format(date, "dd-MM-yyyy");
export const formatNumericDate = (date: Date) => format(date, "dd.MM.yyyy");

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

export const formatDayMonthRange = (
  from: Date,
  to: Date,
  { year = true, dash = "—" }: { year?: boolean; dash?: string } = {},
) => {
  const end = year ? formatDayMonthYearLong(to) : formatDayMonthLong(to);
  if (from.getTime() === to.getTime()) return end;
  return `${formatDayMonthLong(from)} ${dash} ${end}`;
};

export const formatShortDateRange = (
  from: Date,
  to: Date,
  { dash = "–" }: { dash?: string } = {},
) => {
  const currentYear = new Date().getFullYear();
  const showYear =
    from.getFullYear() !== currentYear || to.getFullYear() !== currentYear;
  const fmt = (date: Date) => format(date, showYear ? "dd.MM.yy" : "dd.MM");
  if (from.getTime() === to.getTime()) return fmt(to);
  return `${fmt(from)} ${dash} ${fmt(to)}`;
};

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

export const isCurrentDay = (date?: string | null) => {
  if (!date) {
    return false;
  }

  return isToday(new Date(date));
};
