import { format, parseISO, getHours, getMinutes } from "date-fns";

export const combineDayTime = (day: string, time: string) => `${day}T${time}`;

export const formatTimeString = (time: string) =>
  format(parseISO(time), "HH:mm");

export const formatTime = (date: Date) => {
  if (!date) return "";
  return format(date, "HH:mm");
};

export const getTimeParts = (value: Date | null) => {
  if (!value || !(value instanceof Date) || Number.isNaN(value.getTime())) {
    return { hours: 9, minutes: 0 };
  }

  return {
    hours: getHours(value),
    minutes: getMinutes(value),
  };
};

export const formatDayMonth = (date: string) => {
  if (!date) return "";

  return format(parseISO(date), "dd.MM");
};

export const parseTimeString = (value: string): Date | null => {
  if (!value) return null;
  const parts = value.split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (isNaN(h) || isNaN(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return isNaN(d.getTime()) ? null : d;
};

export const parseTime = (time: string) => {
  const direct = time.match(/^(\d{2}):(\d{2})/);
  if (direct) return +direct[1] * 60 + +direct[2];
  const iso = time.match(/T(\d{2}):(\d{2})/);
  return iso ? +iso[1] * 60 + +iso[2] : 0;
};

export const formatMinutes = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export const formatTimeFromISO = (iso: string) => {
  if (!iso) return "";
  const isoMatch = iso.match(/T(\d{2}):(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}:${isoMatch[2]}`;
  const timeMatch = iso.match(/^(\d{1,2}):(\d{2})/);
  if (timeMatch) return `${timeMatch[1]}:${timeMatch[2]}`;
  return "";
};
